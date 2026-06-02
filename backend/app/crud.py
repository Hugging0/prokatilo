from datetime import datetime, time, timedelta
from decimal import Decimal, ROUND_CEILING
from zoneinfo import ZoneInfo

from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app import models, schemas
from app.auth import hash_password, verify_password


APP_TIMEZONE = ZoneInfo("Europe/Moscow")
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


async def ensure_booking_slot_is_free(
    db: AsyncSession,
    item_id: int,
    rental_start_at: datetime,
    rental_end_at: datetime,
    exclude_order_id: int | None = None,
) -> None:
    stmt = select(func.count(models.OrderModel.id)).where(
        models.OrderModel.item_id == item_id,
        models.OrderModel.status.in_(BOOKING_BLOCKING_STATUSES),
        models.OrderModel.rental_start_at < rental_end_at,
        models.OrderModel.rental_end_at > rental_start_at,
    )

    if exclude_order_id is not None:
        stmt = stmt.where(models.OrderModel.id != exclude_order_id)

    result = await db.execute(stmt)

    if result.scalar_one() > 0:
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
        .order_by(models.OrderModel.rental_start_at.asc())
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
        stmt = stmt.where(
            models.OrderModel.rental_start_at < day_end,
            models.OrderModel.rental_end_at > day_start,
        )

    result = await db.execute(stmt)
    return list(result.scalars().all())


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
        .options(selectinload(models.OrderModel.item))
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
            unit_price = item.price_per_24h * Decimal("7")

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

    rental_start_at, rental_end_at = build_rental_interval(
        rental_date=order_data.rental_date,
        rental_time=order_data.rental_time,
        tariff_type=order_data.tariff_type,
        rental_end_date=order_data.rental_end_date,
        rental_end_time=order_data.rental_end_time,
    )
    await ensure_booking_slot_is_free(
        db=db,
        item_id=order_data.item_id,
        rental_start_at=rental_start_at,
        rental_end_at=rental_end_at,
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
        total_price=get_tariff_price(
            item,
            order_data.tariff_type,
            rental_start_at,
            rental_end_at,
        ),
        rental_date=order_data.rental_date,
        rental_time=order_data.rental_time,
        rental_start_at=rental_start_at,
        rental_end_at=rental_end_at,
        comment=order_data.comment,
        status=schemas.OrderStatus.PENDING.value,
    )

    db.add(db_order)
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
        .options(selectinload(models.OrderModel.item))
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
        .options(selectinload(models.OrderModel.item))
        .where(models.OrderModel.user_id == user_id)
        .order_by(models.OrderModel.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_admin_orders(
    db: AsyncSession,
    status_filter: schemas.OrderStatus | None = None,
) -> list[models.OrderModel]:
    stmt = select(models.OrderModel).options(
        selectinload(models.OrderModel.item),
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
    next_rental_end_date = update_data.get("rental_end_date")
    next_rental_end_time = update_data.get("rental_end_time")
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
        rental_start_at, rental_end_at = build_rental_interval(
            rental_date=next_rental_date,
            rental_time=next_rental_time,
            tariff_type=next_tariff_type,
            rental_end_date=next_rental_end_date,
            rental_end_time=next_rental_end_time,
        )
        await ensure_booking_slot_is_free(
            db=db,
            item_id=order.item_id,
            rental_start_at=rental_start_at,
            rental_end_at=rental_end_at,
            exclude_order_id=order.id,
        )
        order.rental_start_at = rental_start_at
        order.rental_end_at = rental_end_at
        order.total_price = get_tariff_price(
            order.item,
            next_tariff_type,
            rental_start_at,
            rental_end_at,
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
