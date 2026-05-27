from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app import models, schemas


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

    await db.delete(db_item)
    await db.commit()


async def create_order(
    db: AsyncSession,
    order_data: schemas.OrderCreate,
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
        customer_login=order_data.customer_login,
        customer_phone=order_data.customer_phone,
        tariff_type=order_data.tariff_type.value,
        total_price=order_data.total_price,
        status=schemas.OrderStatus.PENDING.value,
    )

    item.is_available = False

    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)

    return db_order


async def update_order_status(
    db: AsyncSession,
    order_id: int,
    new_status: schemas.OrderStatus,
) -> models.OrderModel:
    order = await db.get(models.OrderModel, order_id)

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заказ не найден",
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
    await db.refresh(order)

    return order
