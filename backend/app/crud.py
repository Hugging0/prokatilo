from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, update, delete
from fastapi import HTTPException, status
from decimal import Decimal
import models
import schemas

# --- ОПЕРАЦИИ С ТОВАРАМИ (ITEMS) ---

async def get_items(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Получить список всех товаров с пагинацией."""
    stmt = select(models.ItemModel).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_available_items(db: AsyncSession):
    """Получить только те товары, которые сейчас свободны."""
    stmt = select(models.ItemModel).where(models.ItemModel.is_available == True)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_item_by_id(db: AsyncSession, item_id: int):
    """Найти один товар по ID. Если не найден — кинуть 404."""
    item = await db.get(models.ItemModel, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Товар с ID {item_id} не найден"
        )
    return item


async def search_items(db: AsyncSession, query: str):
    """Поиск по названию или описанию (регистронезависимый)."""
    stmt = select(models.ItemModel).where(
        or_(
            models.ItemModel.title.ilike(f"%{query}%"),
            models.ItemModel.description.ilike(f"%{query}%")
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_item(db: AsyncSession, item_data: schemas.ItemCreate):
    """Создать новый товар."""
    db_item = models.ItemModel(**item_data.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


async def update_item(db: AsyncSession, item_id: int, item_data: schemas.ItemUpdate):
    """
    Обновить данные товара (метод Patch). 
    Обновляет только те поля, которые прислал пользователь.
    """
    db_item = await get_item_by_id(db, item_id)
    
    # exclude_unset=True не дает затереть данные дефолтными значениями None
    update_data = item_data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    await db.commit()
    await db.refresh(db_item)
    return db_item


async def toggle_item_availability(db: AsyncSession, item_id: int):
    """Быстрое переключение статуса 'доступен/занят'."""
    db_item = await get_item_by_id(db, item_id)
    db_item.is_available = not db_item.is_available
    await db.commit()
    await db.refresh(db_item)
    return db_item


async def delete_item(db: AsyncSession, item_id: int):
    """Удалить товар из базы."""
    db_item = await get_item_by_id(db, item_id)
    await db.delete(db_item)
    await db.commit()
    return True


# --- ОПЕРАЦИИ С ЗАКАЗАМИ (ORDERS) ---

async def create_order(db: AsyncSession, order_data: schemas.OrderCreate):
    """Создать заказ и автоматически пометить товар как занятый."""
    # Проверяем, существует ли товар и свободен ли он
    item = await db.get(models.ItemModel, order_data.item_id)
    if not item or not item.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Товар недоступен для заказа"
        )
    
    db_order = models.OrderModel(**order_data.model_dump())
    
    # Бизнес-логика: товар теперь занят
    item.is_available = False
    
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)
    return db_order


async def update_order_status(db: AsyncSession, order_id: int, new_status: str):
    """Изменить статус заказа (например, на 'completed') и освободить товар."""
    order = await db.get(models.OrderModel, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    order.status = new_status
    
    # Если заказ завершен или отменен — возвращаем товар в ротацию
    if new_status in ["completed", "cancelled"]:
        item = await db.get(models.ItemModel, order.item_id)
        if item:
            item.is_available = True
            
    await db.commit()
    await db.refresh(order)
    return order