from datetime import datetime, time, timedelta
from decimal import Decimal, ROUND_CEILING, ROUND_FLOOR
from zoneinfo import ZoneInfo

from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app import models, schemas
from app.auth import hash_password, verify_password


APP_TIMEZONE = ZoneInfo("Europe/Moscow")
LOYALTY_CASHBACK_PERCENT = Decimal("0.05")
MAX_BONUS_SPEND_PERCENT = Decimal("0.30")
MONEY_ZERO = Decimal("0.00")
BOOKING_BLOCKING_STATUSES = (
    schemas.OrderStatus.PENDING.value,
    schemas.OrderStatus.CONFIRMED.value,
    schemas.OrderStatus.DELIVERY.value,
    schemas.OrderStatus.ACTIVE.value,
)
TARIFF_DURATIONS = {
    schemas.TariffType.THREE_HOURS: timedelta(hours=3),
    schemas.TariffType.SIX_HOURS: timedelta(hours=6),
    schemas.TariffType.TWENTY_FOUR_HOURS: timedelta(hours=24),
    schemas.TariffType.SEVEN_DAYS: timedelta(days=7),
}
SERVICE_SETTINGS_DEFAULTS = {
    "timezone": "Europe/Moscow",
    "workday_start": "08:00",
    "workday_end": "20:00",
    "delivery_slot_minutes": 120,
    "min_order_lead_minutes": 15,
    "support_phone": None,
    "service_is_active": True,
    "service_pause_message": None,
    "cash_enabled": True,
    "card_enabled": False,
    "sbp_enabled": False,
    "default_payment_method": schemas.PaymentMethod.CASH.value,
    "cashback_percent": 5,
    "max_bonus_spend_percent": 30,
    "bonus_to_ruble_rate": 1,
}


def _parse_settings_time(value: str) -> time:
    try:
        return time.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Укажите время в формате ЧЧ:ММ",
        ) from exc


def _validate_service_settings(settings: models.ServiceSettingsModel) -> None:
    if _parse_settings_time(settings.workday_start) >= _parse_settings_time(
        settings.workday_end,
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Начало рабочего дня должно быть раньше окончания",
        )

    enabled_methods = {
        schemas.PaymentMethod.CASH.value: settings.cash_enabled,
        schemas.PaymentMethod.CARD.value: settings.card_enabled,
        schemas.PaymentMethod.SBP.value: settings.sbp_enabled,
    }

    if not any(enabled_methods.values()):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Включите хотя бы один способ оплаты",
        )

    if not enabled_methods.get(settings.default_payment_method, False):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Способ оплаты по умолчанию должен быть включен",
        )


async def get_or_create_default_service_settings(
    db: AsyncSession,
) -> models.ServiceSettingsModel:
    result = await db.execute(
        select(models.ServiceSettingsModel).order_by(
            models.ServiceSettingsModel.id.asc(),
        ),
    )
    settings = result.scalars().first()

    if settings:
        return settings

    settings = models.ServiceSettingsModel(**SERVICE_SETTINGS_DEFAULTS)
    db.add(settings)
    await db.commit()
    await db.refresh(settings)
    return settings


async def get_service_settings(db: AsyncSession) -> models.ServiceSettingsModel:
    return await get_or_create_default_service_settings(db)


async def update_service_settings(
    db: AsyncSession,
    payload: schemas.ServiceSettingsUpdate,
) -> models.ServiceSettingsModel:
    settings = await get_or_create_default_service_settings(db)
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if isinstance(value, schemas.PaymentMethod):
            value = value.value
        setattr(settings, field, value)

    _validate_service_settings(settings)
    await db.commit()
    await db.refresh(settings)
    return settings


async def upsert_push_subscription(
    db: AsyncSession,
    user: models.UserModel,
    payload: schemas.PushSubscriptionCreate,
    user_agent: str | None,
) -> models.PushSubscriptionModel:
    result = await db.execute(
        select(models.PushSubscriptionModel).where(
            models.PushSubscriptionModel.endpoint == payload.endpoint,
        ),
    )
    subscription = result.scalar_one_or_none()

    if subscription is None:
        subscription = models.PushSubscriptionModel(endpoint=payload.endpoint)

    subscription.user_id = user.id
    subscription.p256dh = payload.keys.p256dh
    subscription.auth = payload.keys.auth
    subscription.user_agent = user_agent
    subscription.is_active = True

    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    return subscription


async def deactivate_push_subscription(
    db: AsyncSession,
    user: models.UserModel,
    endpoint: str,
) -> None:
    result = await db.execute(
        select(models.PushSubscriptionModel).where(
            models.PushSubscriptionModel.user_id == user.id,
            models.PushSubscriptionModel.endpoint == endpoint,
        ),
    )
    subscription = result.scalar_one_or_none()

    if subscription is not None:
        subscription.is_active = False
        await db.commit()


def get_tariff_duration(tariff_type: schemas.TariffType) -> timedelta:
    return TARIFF_DURATIONS[tariff_type]


def build_rental_interval(
    rental_date: str,
    rental_time: str,
    tariff_type: schemas.TariffType,
    rental_end_date: str | None = None,
    rental_end_time: str | None = None,
) -> tuple[datetime, datetime]:
    try:
        rental_day = datetime.strptime(rental_date, "%Y-%m-%d").date()
        rental_clock = time.fromisoformat(rental_time)
        end_day = (
            datetime.strptime(rental_end_date, "%Y-%m-%d").date()
            if rental_end_date
            else None
        )
        end_clock = time.fromisoformat(rental_end_time) if rental_end_time else None
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Выберите корректные дату и время аренды",
        ) from exc

    start_at = datetime.combine(
        rental_day,
        rental_clock,
        tzinfo=APP_TIMEZONE,
    )

    if end_day and end_clock:
        end_at = datetime.combine(end_day, end_clock, tzinfo=APP_TIMEZONE)
    else:
        end_at = start_at + get_tariff_duration(tariff_type)

    if end_at <= start_at:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Окончание аренды должно быть позже начала",
        )

    return start_at, end_at


def get_order_planned_interval(
    order: models.OrderModel,
) -> tuple[datetime, datetime]:
    return build_rental_interval(
        rental_date=order.rental_date,
        rental_time=order.rental_time,
        tariff_type=schemas.TariffType(order.tariff_type),
    )


def get_order_blocking_interval(
    order: models.OrderModel,
) -> tuple[datetime, datetime]:
    if order.rental_start_at and order.rental_end_at:
        return order.rental_start_at, order.rental_end_at

    return get_order_planned_interval(order)


async def ensure_booking_slot_is_free(
    db: AsyncSession,
    item_id: int,
    rental_start_at: datetime,
    rental_end_at: datetime,
    exclude_order_id: int | None = None,
) -> None:
    stmt = select(models.OrderModel).where(
        models.OrderModel.item_id == item_id,
        models.OrderModel.status.in_(BOOKING_BLOCKING_STATUSES),
    )

    if exclude_order_id is not None:
        stmt = stmt.where(models.OrderModel.id != exclude_order_id)

    result = await db.execute(stmt)

    for order in result.scalars().all():
        blocking_start_at, blocking_end_at = get_order_blocking_interval(order)

        if blocking_start_at < rental_end_at and blocking_end_at > rental_start_at:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "На выбранное время вещь уже забронирована. "
                    "Выберите другой слот."
                ),
            )


async def get_items(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
) -> list[models.ItemModel]:
    stmt = (
        select(models.ItemModel)
        .where(models.ItemModel.is_active.is_(True))
        .order_by(
            models.ItemModel.sort_order.asc(),
            models.ItemModel.created_at.desc(),
        )
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_available_items(db: AsyncSession) -> list[models.ItemModel]:
    stmt = (
        select(models.ItemModel)
        .where(
            models.ItemModel.is_active.is_(True),
            models.ItemModel.is_available.is_(True),
        )
        .order_by(
            models.ItemModel.sort_order.asc(),
            models.ItemModel.created_at.desc(),
        )
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_item_bookings(
    db: AsyncSession,
    item_id: int,
    rental_date: str | None = None,
) -> list[models.OrderModel]:
    await get_public_item_by_id(db, item_id)

    stmt = (
        select(models.OrderModel)
        .where(
            models.OrderModel.item_id == item_id,
            models.OrderModel.status.in_(BOOKING_BLOCKING_STATUSES),
        )
    )

    if rental_date:
        try:
            day = datetime.strptime(rental_date, "%Y-%m-%d").date()
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Выберите корректную дату",
            ) from exc

        day_start = datetime.combine(day, time.min, tzinfo=APP_TIMEZONE)
        day_end = day_start + timedelta(days=1)
    result = await db.execute(stmt)
    orders = list(result.scalars().all())

    if rental_date:
        orders = [
            order
            for order in orders
            if (
                get_order_blocking_interval(order)[0] < day_end
                and get_order_blocking_interval(order)[1] > day_start
            )
        ]

    return sorted(orders, key=lambda order: get_order_blocking_interval(order)[0])


async def get_admin_items(db: AsyncSession) -> list[models.ItemModel]:
    stmt = select(models.ItemModel).order_by(
        models.ItemModel.sort_order.asc(),
        models.ItemModel.created_at.desc(),
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_user_by_email(
    db: AsyncSession,
    email: str,
) -> models.UserModel | None:
    result = await db.execute(
        select(models.UserModel).where(
            models.UserModel.email == email.lower(),
        ),
    )
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    user_data: schemas.AuthRegister,
    is_admin: bool = False,
) -> models.UserModel:
    existing_user = await get_user_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Пользователь с таким email уже существует",
        )

    db_user = models.UserModel(
        email=user_data.email.lower(),
        password_hash=hash_password(user_data.password),
        name=user_data.name.strip(),
        phone=user_data.phone,
        is_admin=is_admin,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
) -> models.UserModel:
    user = await get_user_by_email(db, email)

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )

    return user


async def get_order_by_id(
    db: AsyncSession,
    order_id: int,
) -> models.OrderModel:
    stmt = (
        select(models.OrderModel)
        .options(
            selectinload(models.OrderModel.item),
            selectinload(models.OrderModel.promo_code),
        )
        .where(models.OrderModel.id == order_id)
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заказ не найден",
        )

    return order


def normalize_money(value: Decimal) -> Decimal:
    return Decimal(value).quantize(Decimal("0.01"))


def normalize_promo_code(code: str) -> str:
    return code.strip().upper()


async def get_or_create_loyalty_account(
    db: AsyncSession,
    user_id: int,
) -> models.LoyaltyAccountModel:
    result = await db.execute(
        select(models.LoyaltyAccountModel).where(
            models.LoyaltyAccountModel.user_id == user_id,
        ),
    )
    account = result.scalar_one_or_none()

    if account:
        return account

    account = models.LoyaltyAccountModel(user_id=user_id)
    db.add(account)
    await db.flush()
    return account


async def list_loyalty_transactions(
    db: AsyncSession,
    user_id: int,
    limit: int = 50,
) -> list[models.LoyaltyTransactionModel]:
    stmt = (
        select(models.LoyaltyTransactionModel)
        .where(models.LoyaltyTransactionModel.user_id == user_id)
        .order_by(models.LoyaltyTransactionModel.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_loyalty_summary(
    db: AsyncSession,
    user_id: int,
) -> schemas.LoyaltySummaryRead:
    account = await get_or_create_loyalty_account(db=db, user_id=user_id)
    transactions = await list_loyalty_transactions(db=db, user_id=user_id)

    return schemas.LoyaltySummaryRead(
        account=account,
        recent_transactions=transactions,
    )


async def get_promo_code_by_id(
    db: AsyncSession,
    promo_code_id: int,
) -> models.PromoCodeModel:
    promo_code = await db.get(models.PromoCodeModel, promo_code_id)

    if not promo_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Промокод не найден",
        )

    return promo_code


async def get_promo_code_by_code(
    db: AsyncSession,
    code: str,
) -> models.PromoCodeModel | None:
    result = await db.execute(
        select(models.PromoCodeModel).where(
            models.PromoCodeModel.code == normalize_promo_code(code),
        ),
    )
    return result.scalar_one_or_none()


async def validate_promo_code_for_user(
    db: AsyncSession,
    user_id: int,
    code: str,
    subtotal_price: Decimal,
    allowed_kinds: set[schemas.PromoCodeKind],
) -> models.PromoCodeModel:
    normalized_code = normalize_promo_code(code)

    if not normalized_code:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Введите промокод",
        )

    promo_code = await get_promo_code_by_code(db=db, code=normalized_code)

    if not promo_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Промокод не найден",
        )

    promo_kind = schemas.PromoCodeKind(promo_code.kind)

    if promo_kind not in allowed_kinds:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Этот промокод нельзя применить здесь",
        )

    if not promo_code.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Промокод отключен",
        )

    now = datetime.now(tz=APP_TIMEZONE)

    if promo_code.valid_from and now < promo_code.valid_from:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Промокод пока не действует",
        )

    if promo_code.valid_until and now > promo_code.valid_until:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Срок действия промокода истек",
        )

    if promo_code.min_order_amount and subtotal_price < promo_code.min_order_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Промокод действует от {int(promo_code.min_order_amount)} ₽",
        )

    if promo_code.max_uses is not None and promo_code.used_count >= promo_code.max_uses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Лимит использований промокода исчерпан",
        )

    usage_count_result = await db.execute(
        select(func.count(models.PromoCodeRedemptionModel.id)).where(
            models.PromoCodeRedemptionModel.promo_code_id == promo_code.id,
            models.PromoCodeRedemptionModel.user_id == user_id,
        ),
    )
    usage_count = usage_count_result.scalar_one()

    if usage_count >= promo_code.max_uses_per_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы уже использовали этот промокод",
        )

    return promo_code


def calculate_promo_discount(
    promo_code: models.PromoCodeModel,
    subtotal_price: Decimal,
) -> Decimal:
    promo_kind = schemas.PromoCodeKind(promo_code.kind)

    if promo_kind == schemas.PromoCodeKind.PERCENT_DISCOUNT:
        percent = promo_code.discount_percent or MONEY_ZERO
        return normalize_money(
            min(subtotal_price, subtotal_price * percent / Decimal("100")),
        )

    if promo_kind == schemas.PromoCodeKind.FIXED_DISCOUNT:
        return normalize_money(min(subtotal_price, promo_code.discount_amount or MONEY_ZERO))

    return MONEY_ZERO


async def preview_promo_code(
    db: AsyncSession,
    user_id: int,
    code: str,
    subtotal_price: Decimal,
) -> schemas.PromoCodePreviewRead:
    promo_code = await validate_promo_code_for_user(
        db=db,
        user_id=user_id,
        code=code,
        subtotal_price=subtotal_price,
        allowed_kinds={
            schemas.PromoCodeKind.PERCENT_DISCOUNT,
            schemas.PromoCodeKind.FIXED_DISCOUNT,
            schemas.PromoCodeKind.BONUS_CREDIT,
        },
    )
    promo_kind = schemas.PromoCodeKind(promo_code.kind)
    discount_amount = calculate_promo_discount(promo_code, subtotal_price)
    bonus_amount = normalize_money(promo_code.bonus_amount or MONEY_ZERO)
    message = (
        f"Промокод применен: скидка {int(discount_amount)} ₽"
        if promo_kind != schemas.PromoCodeKind.BONUS_CREDIT
        else f"Промокод начислит {int(bonus_amount)} бонусов"
    )

    return schemas.PromoCodePreviewRead(
        code=promo_code.code,
        title=promo_code.title,
        description=promo_code.description,
        kind=promo_kind,
        discount_amount=discount_amount,
        bonus_amount=bonus_amount,
        message=message,
    )


async def redeem_bonus_credit_promo(
    db: AsyncSession,
    user_id: int,
    code: str,
) -> schemas.PromoCodeActivateRead:
    promo_code = await validate_promo_code_for_user(
        db=db,
        user_id=user_id,
        code=code,
        subtotal_price=MONEY_ZERO,
        allowed_kinds={schemas.PromoCodeKind.BONUS_CREDIT},
    )
    bonus_amount = normalize_money(promo_code.bonus_amount or MONEY_ZERO)

    if bonus_amount <= MONEY_ZERO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="У промокода не указана сумма бонусов",
        )

    account = await get_or_create_loyalty_account(db=db, user_id=user_id)
    account.balance = normalize_money(account.balance + bonus_amount)
    account.lifetime_earned = normalize_money(account.lifetime_earned + bonus_amount)
    promo_code.used_count += 1
    db.add(
        models.PromoCodeRedemptionModel(
            promo_code_id=promo_code.id,
            user_id=user_id,
        ),
    )
    db.add(
        models.LoyaltyTransactionModel(
            user_id=user_id,
            promo_code_id=promo_code.id,
            type=schemas.LoyaltyTransactionType.PROMO_CREDIT.value,
            amount=bonus_amount,
            description=f"Промокод {promo_code.code}",
        ),
    )
    await db.commit()
    await db.refresh(account)

    return schemas.PromoCodeActivateRead(
        balance=account.balance,
        credited_amount=bonus_amount,
        message=f"Промокод активирован: начислено {int(bonus_amount)} бонусов",
    )


def calculate_bonus_spend(
    account_balance: Decimal,
    requested_bonus_spend: Decimal | None,
    subtotal_price: Decimal,
    promo_discount_amount: Decimal,
) -> Decimal:
    if not requested_bonus_spend or requested_bonus_spend <= MONEY_ZERO:
        return MONEY_ZERO

    max_by_percent = normalize_money(subtotal_price * MAX_BONUS_SPEND_PERCENT)
    price_after_promo = max(MONEY_ZERO, subtotal_price - promo_discount_amount)
    return normalize_money(
        min(account_balance, requested_bonus_spend, max_by_percent, price_after_promo),
    )


async def spend_bonuses_for_order(
    db: AsyncSession,
    user_id: int,
    order_id: int,
    amount: Decimal,
) -> None:
    if amount <= MONEY_ZERO:
        return

    account = await get_or_create_loyalty_account(db=db, user_id=user_id)

    if amount > account.balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно бонусов для списания",
        )

    account.balance = normalize_money(account.balance - amount)
    account.lifetime_spent = normalize_money(account.lifetime_spent + amount)
    db.add(
        models.LoyaltyTransactionModel(
            user_id=user_id,
            order_id=order_id,
            type=schemas.LoyaltyTransactionType.SPENT.value,
            amount=-amount,
            description=f"Списание в заказе №{order_id}",
        ),
    )


async def process_loyalty_for_returned_order(
    db: AsyncSession,
    order: models.OrderModel,
) -> None:
    if order.loyalty_processed_at is not None:
        return

    order.loyalty_processed_at = datetime.now(tz=APP_TIMEZONE)

    if not order.user_id:
        return

    bonus_amount = (
        order.total_price * LOYALTY_CASHBACK_PERCENT
    ).to_integral_value(rounding=ROUND_FLOOR)
    bonus_amount = normalize_money(bonus_amount)

    if bonus_amount <= MONEY_ZERO:
        return

    account = await get_or_create_loyalty_account(db=db, user_id=order.user_id)
    account.balance = normalize_money(account.balance + bonus_amount)
    account.lifetime_earned = normalize_money(account.lifetime_earned + bonus_amount)
    order.bonus_earned_amount = bonus_amount
    db.add(
        models.LoyaltyTransactionModel(
            user_id=order.user_id,
            order_id=order.id,
            type=schemas.LoyaltyTransactionType.EARNED.value,
            amount=bonus_amount,
            description=f"5% за аренду №{order.id}",
        ),
    )


async def list_promo_codes(db: AsyncSession) -> list[models.PromoCodeModel]:
    result = await db.execute(
        select(models.PromoCodeModel).order_by(models.PromoCodeModel.created_at.desc()),
    )
    return list(result.scalars().all())


def validate_promo_payload(
    payload: schemas.PromoCodeCreate | schemas.PromoCodeUpdate,
    current_kind: schemas.PromoCodeKind | None = None,
) -> None:
    kind = getattr(payload, "kind", None) or current_kind

    if not kind:
        return

    if kind == schemas.PromoCodeKind.PERCENT_DISCOUNT and not payload.discount_percent:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Укажите процент скидки",
        )

    if kind == schemas.PromoCodeKind.FIXED_DISCOUNT and not payload.discount_amount:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Укажите сумму скидки",
        )

    if kind == schemas.PromoCodeKind.BONUS_CREDIT and not payload.bonus_amount:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Укажите сумму бонусов",
        )


async def create_promo_code(
    db: AsyncSession,
    payload: schemas.PromoCodeCreate,
) -> models.PromoCodeModel:
    validate_promo_payload(payload)
    code = normalize_promo_code(payload.code)

    if await get_promo_code_by_code(db=db, code=code):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Промокод с таким кодом уже существует",
        )

    promo_code = models.PromoCodeModel(
        **payload.model_dump(exclude={"code", "kind"}),
        code=code,
        kind=payload.kind.value,
    )
    db.add(promo_code)
    await db.commit()
    await db.refresh(promo_code)
    return promo_code


async def update_promo_code(
    db: AsyncSession,
    promo_code_id: int,
    payload: schemas.PromoCodeUpdate,
) -> models.PromoCodeModel:
    promo_code = await get_promo_code_by_id(db=db, promo_code_id=promo_code_id)
    validate_promo_payload(payload, current_kind=schemas.PromoCodeKind(promo_code.kind))
    update_data = payload.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(promo_code, key, value)

    await db.commit()
    await db.refresh(promo_code)
    return promo_code


async def archive_promo_code(
    db: AsyncSession,
    promo_code_id: int,
) -> models.PromoCodeModel:
    promo_code = await get_promo_code_by_id(db=db, promo_code_id=promo_code_id)
    promo_code.is_active = False
    await db.commit()
    await db.refresh(promo_code)
    return promo_code


async def get_item_by_id(
    db: AsyncSession,
    item_id: int,
) -> models.ItemModel:
    item = await db.get(models.ItemModel, item_id)

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Товар с ID {item_id} не найден",
        )

    return item


async def get_public_item_by_id(
    db: AsyncSession,
    item_id: int,
) -> models.ItemModel:
    item = await get_item_by_id(db, item_id)

    if not item.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Товар с ID {item_id} не найден",
        )

    return item


async def search_items(
    db: AsyncSession,
    query: str,
) -> list[models.ItemModel]:
    stmt = select(models.ItemModel).where(
        models.ItemModel.is_active.is_(True),
        or_(
            models.ItemModel.title.ilike(f"%{query}%"),
            models.ItemModel.description.ilike(f"%{query}%"),
            models.ItemModel.category.ilike(f"%{query}%"),
        ),
    ).order_by(
        models.ItemModel.sort_order.asc(),
        models.ItemModel.created_at.desc(),
    )

    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_item(
    db: AsyncSession,
    item_data: schemas.ItemCreate,
) -> models.ItemModel:
    db_item = models.ItemModel(**item_data.model_dump())

    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)

    return db_item


async def update_item(
    db: AsyncSession,
    item_id: int,
    item_data: schemas.ItemUpdate,
) -> models.ItemModel:
    db_item = await get_item_by_id(db, item_id)
    update_data = item_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_item, key, value)

    await db.commit()
    await db.refresh(db_item)

    return db_item


async def toggle_item_availability(
    db: AsyncSession,
    item_id: int,
) -> models.ItemModel:
    db_item = await get_item_by_id(db, item_id)

    db_item.is_available = not db_item.is_available

    await db.commit()
    await db.refresh(db_item)

    return db_item


async def set_item_availability(
    db: AsyncSession,
    item_id: int,
    is_available: bool,
) -> models.ItemModel:
    db_item = await get_item_by_id(db, item_id)
    db_item.is_available = is_available

    await db.commit()
    await db.refresh(db_item)

    return db_item


async def archive_item(
    db: AsyncSession,
    item_id: int,
) -> models.ItemModel:
    db_item = await get_item_by_id(db, item_id)
    db_item.is_active = False

    await db.commit()
    await db.refresh(db_item)

    return db_item


async def delete_item(
    db: AsyncSession,
    item_id: int,
) -> None:
    db_item = await get_item_by_id(db, item_id)
    order_count_result = await db.execute(
        select(func.count(models.OrderModel.id)).where(
            models.OrderModel.item_id == item_id,
        ),
    )
    order_count = order_count_result.scalar_one()

    if order_count > 0:
        db_item.is_active = False
        await db.commit()
        return

    await db.delete(db_item)
    await db.commit()


def get_tariff_price(
    item: models.ItemModel,
    tariff_type: schemas.TariffType,
    rental_start_at: datetime | None = None,
    rental_end_at: datetime | None = None,
):
    match tariff_type:
        case schemas.TariffType.THREE_HOURS:
            unit_price = item.price_per_3h
        case schemas.TariffType.SIX_HOURS:
            unit_price = item.price_per_6h
        case schemas.TariffType.TWENTY_FOUR_HOURS:
            unit_price = item.price_per_24h
        case schemas.TariffType.SEVEN_DAYS:
            unit_price = item.price_per_7d

    if rental_start_at is None or rental_end_at is None:
        return unit_price

    duration_seconds = Decimal(
        str((rental_end_at - rental_start_at).total_seconds()),
    )
    unit_seconds = Decimal(str(get_tariff_duration(tariff_type).total_seconds()))
    units_count = max(
        Decimal("1"),
        (duration_seconds / unit_seconds).to_integral_value(
            rounding=ROUND_CEILING,
        ),
    )
    return unit_price * units_count


async def create_order(
    db: AsyncSession,
    order_data: schemas.OrderCreate,
    user: models.UserModel,
) -> models.OrderModel:
    item = await db.get(models.ItemModel, order_data.item_id)

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Товар с ID {order_data.item_id} не найден",
        )

    if not item.is_active or not item.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Товар недоступен для заказа",
        )

    planned_start_at, planned_end_at = build_rental_interval(
        rental_date=order_data.rental_date,
        rental_time=order_data.rental_time,
        tariff_type=order_data.tariff_type,
    )
    await ensure_booking_slot_is_free(
        db=db,
        item_id=order_data.item_id,
        rental_start_at=planned_start_at,
        rental_end_at=planned_end_at,
    )
    subtotal_price = normalize_money(
        get_tariff_price(
            item,
            order_data.tariff_type,
            None,
            None,
        ),
    )
    promo_code = None
    promo_discount_amount = MONEY_ZERO

    if order_data.promo_code:
        promo_code = await validate_promo_code_for_user(
            db=db,
            user_id=user.id,
            code=order_data.promo_code,
            subtotal_price=subtotal_price,
            allowed_kinds={
                schemas.PromoCodeKind.PERCENT_DISCOUNT,
                schemas.PromoCodeKind.FIXED_DISCOUNT,
            },
        )
        promo_discount_amount = calculate_promo_discount(
            promo_code=promo_code,
            subtotal_price=subtotal_price,
        )

    account = await get_or_create_loyalty_account(db=db, user_id=user.id)
    bonus_spent_amount = calculate_bonus_spend(
        account_balance=account.balance,
        requested_bonus_spend=order_data.bonus_spend_amount,
        subtotal_price=subtotal_price,
        promo_discount_amount=promo_discount_amount,
    )
    total_price = normalize_money(
        max(MONEY_ZERO, subtotal_price - promo_discount_amount - bonus_spent_amount),
    )

    db_order = models.OrderModel(
        item_id=order_data.item_id,
        user_id=user.id,
        customer_login=user.email,
        customer_name=order_data.customer_name or user.name,
        customer_email=user.email,
        customer_phone=order_data.customer_phone,
        delivery_address=order_data.delivery_address,
        payment_method=order_data.payment_method.value,
        payment_status=(
            schemas.PaymentStatus.NOT_REQUIRED.value
            if order_data.payment_method == schemas.PaymentMethod.CASH
            else schemas.PaymentStatus.PENDING.value
        ),
        tariff_type=order_data.tariff_type.value,
        subtotal_price=subtotal_price,
        promo_code_id=promo_code.id if promo_code else None,
        promo_discount_amount=promo_discount_amount,
        bonus_spent_amount=bonus_spent_amount,
        total_price=total_price,
        rental_date=order_data.rental_date,
        rental_time=order_data.rental_time,
        rental_start_at=None,
        rental_end_at=None,
        comment=order_data.comment,
        status=schemas.OrderStatus.PENDING.value,
    )

    db.add(db_order)
    await db.flush()

    if promo_code:
        promo_code.used_count += 1
        db.add(
            models.PromoCodeRedemptionModel(
                promo_code_id=promo_code.id,
                user_id=user.id,
                order_id=db_order.id,
            ),
        )

    await spend_bonuses_for_order(
        db=db,
        user_id=user.id,
        order_id=db_order.id,
        amount=bonus_spent_amount,
    )

    await db.commit()
    return await get_order_by_id(db, db_order.id)


async def get_order_for_user(
    db: AsyncSession,
    order_id: int,
    user_id: int,
) -> models.OrderModel:
    order = await get_order_by_id(db, order_id)

    if order.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Заказ недоступен для этого аккаунта",
        )

    return order


async def get_orders_by_customer_phone(
    db: AsyncSession,
    customer_phone: str,
) -> list[models.OrderModel]:
    stmt = (
        select(models.OrderModel)
        .options(
            selectinload(models.OrderModel.item),
            selectinload(models.OrderModel.promo_code),
        )
        .where(models.OrderModel.customer_phone == customer_phone)
        .order_by(models.OrderModel.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_orders_by_user(
    db: AsyncSession,
    user_id: int,
) -> list[models.OrderModel]:
    stmt = (
        select(models.OrderModel)
        .options(
            selectinload(models.OrderModel.item),
            selectinload(models.OrderModel.promo_code),
        )
        .where(models.OrderModel.user_id == user_id)
        .order_by(models.OrderModel.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_user_order_address(
    db: AsyncSession,
    order_id: int,
    user_id: int,
    delivery_address: str,
) -> models.OrderModel:
    order = await get_order_for_user(db=db, order_id=order_id, user_id=user_id)

    if schemas.OrderStatus(order.status) not in {
        schemas.OrderStatus.PENDING,
        schemas.OrderStatus.CONFIRMED,
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Адрес можно изменить только до передачи заказа курьеру",
        )

    order.delivery_address = delivery_address

    await db.commit()
    return await get_order_by_id(db, order.id)


async def cancel_user_order(
    db: AsyncSession,
    order_id: int,
    user_id: int,
) -> models.OrderModel:
    order = await get_order_for_user(db=db, order_id=order_id, user_id=user_id)
    current_status = schemas.OrderStatus(order.status)

    if current_status == schemas.OrderStatus.CANCELLED:
        return order

    if current_status not in {
        schemas.OrderStatus.PENDING,
        schemas.OrderStatus.CONFIRMED,
    }:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Бронь можно отменить только до передачи заказа курьеру",
        )

    if order.payment_status == schemas.PaymentStatus.SUCCEEDED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Бронь уже оплачена. Для отмены свяжитесь с поддержкой.",
        )

    order.status = schemas.OrderStatus.CANCELLED.value

    await db.commit()
    return await get_order_by_id(db, order.id)


async def get_admin_orders(
    db: AsyncSession,
    status_filter: schemas.OrderStatus | None = None,
) -> list[models.OrderModel]:
    stmt = select(models.OrderModel).options(
        selectinload(models.OrderModel.item),
        selectinload(models.OrderModel.promo_code),
    )

    if status_filter is not None:
        stmt = stmt.where(models.OrderModel.status == status_filter.value)

    stmt = stmt.order_by(models.OrderModel.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_order(
    db: AsyncSession,
    order_id: int,
    order_data: schemas.OrderUpdate,
) -> models.OrderModel:
    order = await get_order_by_id(db, order_id)
    update_data = order_data.model_dump(exclude_unset=True)
    next_rental_date = update_data.get("rental_date", order.rental_date)
    next_rental_time = update_data.get("rental_time", order.rental_time)
    next_tariff_type = update_data.get(
        "tariff_type",
        schemas.TariffType(order.tariff_type),
    )

    if isinstance(next_tariff_type, str):
        next_tariff_type = schemas.TariffType(next_tariff_type)

    should_update_interval = any(
        key in update_data
        for key in {
            "rental_date",
            "rental_time",
            "rental_end_date",
            "rental_end_time",
            "tariff_type",
        }
    )

    if should_update_interval:
        planned_start_at, planned_end_at = build_rental_interval(
            rental_date=next_rental_date,
            rental_time=next_rental_time,
            tariff_type=next_tariff_type,
        )
        await ensure_booking_slot_is_free(
            db=db,
            item_id=order.item_id,
            rental_start_at=planned_start_at,
            rental_end_at=planned_end_at,
            exclude_order_id=order.id,
        )
        order.subtotal_price = normalize_money(
            get_tariff_price(
                order.item,
                next_tariff_type,
                None,
                None,
            ),
        )
        order.total_price = normalize_money(
            max(
                MONEY_ZERO,
                order.subtotal_price
                - order.promo_discount_amount
                - order.bonus_spent_amount,
            ),
        )

    for key, value in update_data.items():
        if key in {"rental_end_date", "rental_end_time"}:
            continue

        if key in {"payment_method", "tariff_type"} and value is not None:
            setattr(order, key, value.value)
            continue

        setattr(order, key, value)

    await db.commit()
    return await get_order_by_id(db, order_id)


async def update_order_status(
    db: AsyncSession,
    order_id: int,
    new_status: schemas.OrderStatus,
) -> models.OrderModel:
    order = await get_order_by_id(db, order_id)
    current_status = schemas.OrderStatus(order.status)

    if current_status in {
        schemas.OrderStatus.CANCELLED,
        schemas.OrderStatus.RETURNED,
    } and new_status != current_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недопустимый переход статуса заказа",
        )

    order.status = new_status.value

    if new_status == schemas.OrderStatus.ACTIVE and not order.rental_start_at:
        rental_start_at = datetime.now(tz=APP_TIMEZONE)
        order.rental_start_at = rental_start_at
        order.rental_end_at = rental_start_at + get_tariff_duration(
            schemas.TariffType(order.tariff_type),
        )

    if new_status == schemas.OrderStatus.RETURNED:
        await process_loyalty_for_returned_order(db=db, order=order)

    await db.commit()
    return await get_order_by_id(db, order_id)


async def attach_order_payment(
    db: AsyncSession,
    order_id: int,
    payment_id: str,
    confirmation_url: str | None,
    payment_status: schemas.PaymentStatus,
) -> models.OrderModel:
    order = await get_order_by_id(db, order_id)
    order.yookassa_payment_id = payment_id
    order.yookassa_confirmation_url = confirmation_url
    order.payment_status = payment_status.value

    await db.commit()
    return await get_order_by_id(db, order_id)


async def update_order_payment_status(
    db: AsyncSession,
    payment_id: str,
    payment_status: schemas.PaymentStatus,
) -> models.OrderModel:
    stmt = (
        select(models.OrderModel)
        .options(selectinload(models.OrderModel.item))
        .where(models.OrderModel.yookassa_payment_id == payment_id)
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заказ по платежу не найден",
        )

    order.payment_status = payment_status.value

    if payment_status == schemas.PaymentStatus.SUCCEEDED:
        order.status = schemas.OrderStatus.CONFIRMED.value

    if payment_status == schemas.PaymentStatus.CANCELED:
        order.status = schemas.OrderStatus.CANCELLED.value

    await db.commit()
    return await get_order_by_id(db, order.id)
