import asyncio
import json
import logging
from collections.abc import Awaitable
from typing import Any

from pywebpush import WebPushException, webpush
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app import models, schemas
from app.database import SessionLocal
from app.settings import Settings
from app.telegram_notifications import notify_telegram_admins_about_new_order

logger = logging.getLogger(__name__)

STATUS_PUSH_COPY: dict[schemas.OrderStatus, tuple[str, str]] = {
    schemas.OrderStatus.CONFIRMED: (
        "Бронь подтверждена",
        "Оператор подтвердил вашу бронь. Скоро передадим вещь в доставку.",
    ),
    schemas.OrderStatus.DELIVERY: (
        "Вещь уже в доставке",
        "Курьер везёт вашу бронь. Проверьте телефон на связи.",
    ),
    schemas.OrderStatus.ACTIVE: (
        "Аренда началась",
        "Вещь передана вам. Хорошего пользования!",
    ),
    schemas.OrderStatus.RETURNED: (
        "Аренда завершена",
        "Спасибо! Будем рады вашему отзыву о прокате.",
    ),
    schemas.OrderStatus.CANCELLED: (
        "Бронь отменена",
        "Если нужна помощь, свяжитесь с поддержкой сервиса.",
    ),
}


def _build_subscription_info(
    subscription: models.PushSubscriptionModel,
) -> dict[str, Any]:
    return {
        "endpoint": subscription.endpoint,
        "keys": {
            "p256dh": subscription.p256dh,
            "auth": subscription.auth,
        },
    }


def _is_expired_subscription(error: WebPushException) -> bool:
    response = getattr(error, "response", None)
    status_code = getattr(response, "status_code", None)
    return status_code in {404, 410}


async def _send_to_subscriptions(
    db: AsyncSession,
    settings: Settings,
    subscriptions: list[models.PushSubscriptionModel],
    payload: dict[str, str],
) -> None:
    if not settings.web_push_is_configured or not subscriptions:
        return

    should_commit = False

    for subscription in subscriptions:
        try:
            await asyncio.to_thread(
                webpush,
                subscription_info=_build_subscription_info(subscription),
                data=json.dumps(payload, ensure_ascii=False),
                vapid_private_key=settings.web_push_vapid_private_key,
                vapid_claims={"sub": settings.web_push_vapid_subject},
                ttl=60 * 60,
            )
        except WebPushException as exc:
            if _is_expired_subscription(exc):
                subscription.is_active = False
                should_commit = True
            else:
                logger.warning(
                    "Failed to send web push notification: %s",
                    exc,
                )
        except Exception as exc:
            logger.warning(
                "Skipped web push notification because push configuration is invalid: %s",
                exc,
            )

    if should_commit:
        await db.commit()


async def _notify_admins_by_web_push(
    settings: Settings,
    order_id: int,
) -> None:
    async with SessionLocal() as db:
        order_result = await db.execute(
            select(models.OrderModel)
            .options(selectinload(models.OrderModel.item))
            .where(models.OrderModel.id == order_id),
        )
        order = order_result.scalar_one_or_none()
        if order is None:
            logger.warning("Web Push notification skipped: order %s not found", order_id)
            return

        admin_ids_result = await db.execute(
            select(models.UserModel.id).where(
                models.UserModel.is_admin.is_(True),
                models.UserModel.is_active.is_(True),
            ),
        )
        admin_ids = list(admin_ids_result.scalars())

        if not admin_ids:
            return

        subscriptions_result = await db.execute(
            select(models.PushSubscriptionModel).where(
                models.PushSubscriptionModel.user_id.in_(admin_ids),
                models.PushSubscriptionModel.is_active.is_(True),
            ),
        )
        subscriptions = list(subscriptions_result.scalars())

        await _send_to_subscriptions(
            db=db,
            settings=settings,
            subscriptions=subscriptions,
            payload={
                "title": "Новая бронь",
                "body": f"#{order.id} · {order.customer_name}: {order.item.title}",
                "url": "/app",
            },
        )


async def _run_notification_channel(
    channel_name: str,
    notification: Awaitable[None],
) -> None:
    try:
        await notification
    except Exception:
        logger.exception("New order notification channel failed: %s", channel_name)


async def notify_admins_about_new_order(
    settings: Settings,
    order_id: int,
) -> None:
    await asyncio.gather(
        _run_notification_channel(
            "web_push",
            _notify_admins_by_web_push(settings=settings, order_id=order_id),
        ),
        _run_notification_channel(
            "telegram",
            notify_telegram_admins_about_new_order(
                settings=settings,
                order_id=order_id,
            ),
        ),
    )


async def notify_user_about_order_status(
    db: AsyncSession,
    settings: Settings,
    order: models.OrderModel,
) -> None:
    if order.user_id is None:
        return

    status_value = schemas.OrderStatus(order.status)
    status_copy = STATUS_PUSH_COPY.get(status_value)

    if status_copy is None:
        return

    subscriptions_result = await db.execute(
        select(models.PushSubscriptionModel).where(
            models.PushSubscriptionModel.user_id == order.user_id,
            models.PushSubscriptionModel.is_active.is_(True),
        ),
    )
    subscriptions = list(subscriptions_result.scalars())
    title, body = status_copy

    await _send_to_subscriptions(
        db=db,
        settings=settings,
        subscriptions=subscriptions,
        payload={
            "title": title,
            "body": body,
            "url": "/",
        },
    )
