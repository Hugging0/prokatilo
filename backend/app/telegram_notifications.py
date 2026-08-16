import html
import logging
from decimal import Decimal
from typing import Any

import httpx
from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from app import models, schemas
from app.database import SessionLocal
from app.settings import Settings

logger = logging.getLogger(__name__)

TELEGRAM_API_ROOT = "https://api.telegram.org"
TELEGRAM_TIMEOUT_SECONDS = 5.0
TARIFF_LABELS = {
    schemas.TariffType.THREE_HOURS.value: "3 часа",
    schemas.TariffType.TWENTY_FOUR_HOURS.value: "1 сутки",
    schemas.TariffType.SEVEN_DAYS.value: "7 дней",
}
PAYMENT_LABELS = {
    schemas.PaymentMethod.CASH.value: "при получении",
    schemas.PaymentMethod.CARD.value: "картой",
    schemas.PaymentMethod.SBP.value: "по СБП",
}


class TelegramApiError(RuntimeError):
    def __init__(self, error_code: int | None, description: str) -> None:
        super().__init__(description)
        self.error_code = error_code


def normalize_telegram_username(username: str | None) -> str | None:
    if not username:
        return None

    normalized = username.strip().removeprefix("@").lower()
    return normalized or None


def telegram_command(text: str | None) -> str | None:
    if not text:
        return None

    first_token = text.strip().split(maxsplit=1)[0]
    if not first_token.startswith("/"):
        return None

    return first_token.split("@", maxsplit=1)[0].lower()


async def telegram_api_call(
    settings: Settings,
    method: str,
    payload: dict[str, Any],
) -> dict[str, Any]:
    if not settings.telegram_bot_token:
        raise TelegramApiError(None, "Telegram bot is not configured")

    url = f"{TELEGRAM_API_ROOT}/bot{settings.telegram_bot_token}/{method}"

    try:
        async with httpx.AsyncClient(timeout=TELEGRAM_TIMEOUT_SECONDS) as client:
            response = await client.post(url, json=payload)
            data = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise TelegramApiError(None, type(exc).__name__) from exc

    if not response.is_success or not data.get("ok"):
        raise TelegramApiError(
            data.get("error_code"),
            str(data.get("description") or "Telegram API request failed"),
        )

    result = data.get("result")
    return result if isinstance(result, dict) else {}


async def send_telegram_message(
    settings: Settings,
    chat_id: int,
    text: str,
    *,
    include_admin_button: bool = False,
) -> None:
    payload: dict[str, Any] = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }

    if include_admin_button:
        payload["reply_markup"] = {
            "inline_keyboard": [
                [
                    {
                        "text": "Открыть приложение",
                        "url": settings.telegram_admin_app_url,
                    },
                ],
            ],
        }

    await telegram_api_call(settings, "sendMessage", payload)


async def _upsert_subscription(
    telegram_user_id: int,
    chat_id: int,
    username: str,
) -> None:
    async with SessionLocal() as db:
        result = await db.execute(
            select(models.TelegramAdminSubscriptionModel).where(
                or_(
                    models.TelegramAdminSubscriptionModel.telegram_user_id
                    == telegram_user_id,
                    models.TelegramAdminSubscriptionModel.chat_id == chat_id,
                ),
            ),
        )
        subscription = result.scalars().first()

        if subscription is None:
            subscription = models.TelegramAdminSubscriptionModel(
                telegram_user_id=telegram_user_id,
                chat_id=chat_id,
                username=username,
            )
            db.add(subscription)
        else:
            subscription.telegram_user_id = telegram_user_id
            subscription.chat_id = chat_id
            subscription.username = username
            subscription.is_active = True

        await db.commit()


async def _deactivate_subscription(telegram_user_id: int, chat_id: int) -> None:
    async with SessionLocal() as db:
        result = await db.execute(
            select(models.TelegramAdminSubscriptionModel).where(
                or_(
                    models.TelegramAdminSubscriptionModel.telegram_user_id
                    == telegram_user_id,
                    models.TelegramAdminSubscriptionModel.chat_id == chat_id,
                ),
            ),
        )
        subscription = result.scalars().first()

        if subscription is not None:
            subscription.is_active = False
            await db.commit()


async def handle_telegram_update(
    settings: Settings,
    update: schemas.TelegramUpdate,
) -> None:
    message = update.message
    if message is None or message.from_user is None or message.chat.type != "private":
        return

    command = telegram_command(message.text)
    if command not in {"/start", "/stop"}:
        return

    telegram_user_id = message.from_user.id
    chat_id = message.chat.id

    if command == "/stop":
        await _deactivate_subscription(telegram_user_id, chat_id)
        await send_telegram_message(
            settings,
            chat_id,
            "Уведомления о новых заказах отключены.",
        )
        return

    username = normalize_telegram_username(message.from_user.username)
    if username is None:
        await send_telegram_message(
            settings,
            chat_id,
            "Для подключения задайте username в настройках Telegram и нажмите Start ещё раз.",
        )
        return

    if username not in settings.telegram_allowed_username_set:
        await send_telegram_message(
            settings,
            chat_id,
            "У этого аккаунта нет доступа к служебным уведомлениям ПРОКАТило.",
        )
        return

    await _upsert_subscription(telegram_user_id, chat_id, username)
    await send_telegram_message(
        settings,
        chat_id,
        "Готово. Сюда будут приходить уведомления о новых заказах ПРОКАТило.",
    )


def _format_money(value: Decimal) -> str:
    return f"{value:,.0f}".replace(",", " ")


def build_new_order_message(order: models.OrderModel) -> str:
    tariff = TARIFF_LABELS.get(order.tariff_type, order.tariff_type)
    payment = PAYMENT_LABELS.get(order.payment_method, order.payment_method)
    lines = [
        f"<b>Новая бронь №{order.id}</b>",
        "",
        f"<b>{html.escape(order.item.title)}</b>",
        f"{html.escape(tariff)} · {_format_money(order.total_price)} ₽ · {html.escape(payment)}",
        f"Доставка: {html.escape(order.rental_date)}, {html.escape(order.rental_time)}",
        "",
        f"Клиент: {html.escape(order.customer_name)}",
        f"Телефон: {html.escape(order.customer_phone)}",
        f"Адрес: {html.escape(order.delivery_address)}",
    ]

    if order.comment:
        lines.extend(["", f"Комментарий: {html.escape(order.comment)}"])

    return "\n".join(lines)


async def notify_telegram_admins_about_new_order(
    settings: Settings,
    order_id: int,
) -> None:
    if not settings.telegram_is_configured:
        return

    async with SessionLocal() as db:
        order_result = await db.execute(
            select(models.OrderModel)
            .options(selectinload(models.OrderModel.item))
            .where(models.OrderModel.id == order_id),
        )
        order = order_result.scalar_one_or_none()
        if order is None:
            logger.warning("Telegram notification skipped: order %s not found", order_id)
            return

        subscriptions_result = await db.execute(
            select(models.TelegramAdminSubscriptionModel).where(
                models.TelegramAdminSubscriptionModel.is_active.is_(True),
            ),
        )
        subscriptions = list(subscriptions_result.scalars())
        message = build_new_order_message(order)
        should_commit = False

        for subscription in subscriptions:
            if subscription.username not in settings.telegram_allowed_username_set:
                subscription.is_active = False
                should_commit = True
                continue

            try:
                chat = await telegram_api_call(
                    settings,
                    "getChat",
                    {"chat_id": subscription.chat_id},
                )
            except TelegramApiError as exc:
                if exc.error_code in {400, 403}:
                    subscription.is_active = False
                    should_commit = True
                logger.warning(
                    "Telegram recipient validation failed for subscription %s (code=%s)",
                    subscription.id,
                    exc.error_code,
                )
                continue

            current_username = normalize_telegram_username(chat.get("username"))
            if current_username not in settings.telegram_allowed_username_set:
                subscription.is_active = False
                should_commit = True
                continue

            if current_username != subscription.username:
                subscription.username = current_username
                should_commit = True

            try:
                await send_telegram_message(
                    settings,
                    subscription.chat_id,
                    message,
                    include_admin_button=True,
                )
            except TelegramApiError as exc:
                if exc.error_code == 403:
                    subscription.is_active = False
                    should_commit = True
                logger.warning(
                    "Telegram order notification failed for subscription %s (code=%s)",
                    subscription.id,
                    exc.error_code,
                )

        if should_commit:
            await db.commit()
