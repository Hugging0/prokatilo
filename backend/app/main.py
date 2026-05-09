from fastapi import FastAPI, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

# Импортируем наши модули
import crud
import models
import schemas
from database import engine, get_db, Base

app = FastAPI(
    title="Neighborhood Rental API",
    description="API для сервиса аренды вещей между соседями",
    version="1.0.0"
)

# Создаем таблицы при запуске (удобно для MVP)
# В реальном проекте лучше использовать Alembic
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Это создаст таблицы в БД, если их еще нет
        await conn.run_sync(Base.metadata.create_all)


# --- ЭНДПОИНТЫ ДЛЯ ТОВАРОВ (ITEMS) ---

@app.get("/items/", response_model=List[schemas.ItemRead], tags=["Items"])
async def read_items(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    """Получить список всех товаров."""
    return await crud.get_items(db, skip=skip, limit=limit)


@app.get("/items/available/", response_model=List[schemas.ItemRead], tags=["Items"])
async def read_available_items(db: AsyncSession = Depends(get_db)):
    """Показать только те вещи, которые можно забронировать прямо сейчас."""
    return await crud.get_available_items(db)


@app.get("/items/search/", response_model=List[schemas.ItemRead], tags=["Items"])
async def search_items(
    q: str = Query(..., min_length=2, description="Поисковый запрос"),
    db: AsyncSession = Depends(get_db)
):
    """Поиск товаров по названию или описанию."""
    return await crud.search_items(db, query=q)


@app.get("/items/{item_id}", response_model=schemas.ItemRead, tags=["Items"])
async def read_item(item_id: int, db: AsyncSession = Depends(get_db)):
    """Получить детальную информацию об одном товаре."""
    return await crud.get_item_by_id(db, item_id=item_id)


@app.post("/items/", response_model=schemas.ItemRead, status_code=status.HTTP_201_CREATED, tags=["Items"])
async def create_item(item: schemas.ItemCreate, db: AsyncSession = Depends(get_db)):
    """Добавить новый товар в каталог."""
    return await crud.create_item(db=db, item_data=item)


@app.patch("/items/{item_id}", response_model=schemas.ItemRead, tags=["Items"])
async def update_item(
    item_id: int, 
    item_update: schemas.ItemUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Обновить информацию о товаре (цены, описание и т.д.)."""
    return await crud.update_item(db=db, item_id=item_id, item_data=item_update)


@app.patch("/items/{item_id}/toggle", response_model=schemas.ItemRead, tags=["Items"])
async def toggle_item(item_id: int, db: AsyncSession = Depends(get_db)):
    """Переключить доступность товара (скрыть/показать)."""
    return await crud.toggle_item_availability(db=db, item_id=item_id)


@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Items"])
async def delete_item(item_id: int, db: AsyncSession = Depends(get_db)):
    """Полностью удалить товар из базы данных."""
    await crud.delete_item(db=db, item_id=item_id)
    return None


# --- ЭНДПОИНТЫ ДЛЯ ЗАКАЗОВ (ORDERS) ---

@app.post("/orders/", response_model=schemas.OrderRead, status_code=status.HTTP_201_CREATED, tags=["Orders"])
async def create_order(order: schemas.OrderCreate, db: AsyncSession = Depends(get_db)):
    """Создать новый заказ на аренду вещи."""
    return await crud.create_order(db=db, order_data=order)


@app.patch("/orders/{order_id}/status", response_model=schemas.OrderRead, tags=["Orders"])
async def change_order_status(
    order_id: int, 
    new_status: str = Query(..., description="Новый статус (pending, active, completed, cancelled)"), 
    db: AsyncSession = Depends(get_db)
):
    """Изменить статус заказа и обновить состояние товара."""
    return await crud.update_order_status(db=db, order_id=order_id, new_status=new_status)