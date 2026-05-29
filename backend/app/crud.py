from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app import models, schemas
from app.auth import hash_password, verify_password


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
):
    match tariff_type:
        case schemas.TariffType.THREE_HOURS:
            return item.price_per_3h
        case schemas.TariffType.SIX_HOURS:
            return item.price_per_6h
        case schemas.TariffType.TWENTY_FOUR_HOURS:
            return item.price_per_24h


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
        total_price=get_tariff_price(item, order_data.tariff_type),
        rental_date=order_data.rental_date,
        rental_time=order_data.rental_time,
        comment=order_data.comment,
        status=schemas.OrderStatus.PENDING.value,
    )

    item.is_available = False

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

    for key, value in update_data.items():
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

    if new_status in {
        schemas.OrderStatus.RETURNED,
        schemas.OrderStatus.CANCELLED,
    }:
        item = await db.get(models.ItemModel, order.item_id)

        if item:
            item.is_available = True

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
        item = await db.get(models.ItemModel, order.item_id)

        if item:
            item.is_available = True

    await db.commit()
    return await get_order_by_id(db, order.id)
