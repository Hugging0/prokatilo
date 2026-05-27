from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, models, schemas
from app.database import Base, engine, get_db
from app.settings import get_settings


settings = get_settings()


async def verify_admin_token(
    x_admin_token: Annotated[str | None, Header()] = None,
) -> None:
    if not settings.admin_api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin API key is not configured",
        )

    if x_admin_token != settings.admin_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token",
        )

app = FastAPI(
    title="ПРОКАТило API",
    description=(
        "API для MVP сервиса централизованной аренды вещей и техники "
        "с доставкой за 15 минут и без залога."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    # Production schema changes are handled by Alembic migrations.
    if not settings.create_tables_on_startup:
        return

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get(
    "/health",
    response_model=schemas.HealthRead,
    tags=["System"],
)
async def health_check() -> schemas.HealthRead:
    return schemas.HealthRead(
        status="ok",
        service="prokatilo-api",
    )


@app.get(
    "/items/",
    response_model=list[schemas.ItemRead],
    tags=["Items"],
)
async def read_items(
    db: Annotated[AsyncSession, Depends(get_db)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
) -> list[models.ItemModel]:
    return await crud.get_items(db, skip=skip, limit=limit)


@app.get(
    "/items/available/",
    response_model=list[schemas.ItemRead],
    tags=["Items"],
)
async def read_available_items(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[models.ItemModel]:
    return await crud.get_available_items(db)


@app.get(
    "/items/search/",
    response_model=list[schemas.ItemRead],
    tags=["Items"],
)
async def search_items(
    db: Annotated[AsyncSession, Depends(get_db)],
    q: str = Query(..., min_length=2, description="Поисковый запрос"),
) -> list[models.ItemModel]:
    return await crud.search_items(db, query=q)


@app.get(
    "/items/{item_id}",
    response_model=schemas.ItemRead,
    tags=["Items"],
)
async def read_item(
    item_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.ItemModel:
    return await crud.get_public_item_by_id(db, item_id=item_id)


@app.post(
    "/admin/items/",
    response_model=schemas.AdminItemRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Items"],
    dependencies=[Depends(verify_admin_token)],
)
async def create_admin_item(
    item: schemas.ItemCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.ItemModel:
    return await crud.create_item(db=db, item_data=item)


@app.get(
    "/admin/items/",
    response_model=list[schemas.AdminItemRead],
    tags=["Admin Items"],
    dependencies=[Depends(verify_admin_token)],
)
async def read_admin_items(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[models.ItemModel]:
    return await crud.get_admin_items(db)


@app.patch(
    "/admin/items/{item_id}",
    response_model=schemas.AdminItemRead,
    tags=["Admin Items"],
    dependencies=[Depends(verify_admin_token)],
)
async def update_admin_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.ItemModel:
    return await crud.update_item(
        db=db,
        item_id=item_id,
        item_data=item_update,
    )


@app.patch(
    "/admin/items/{item_id}/availability",
    response_model=schemas.AdminItemRead,
    tags=["Admin Items"],
    dependencies=[Depends(verify_admin_token)],
)
async def set_admin_item_availability(
    item_id: int,
    is_available: bool,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.ItemModel:
    return await crud.set_item_availability(
        db=db,
        item_id=item_id,
        is_available=is_available,
    )


@app.patch(
    "/admin/items/{item_id}/archive",
    response_model=schemas.AdminItemRead,
    tags=["Admin Items"],
    dependencies=[Depends(verify_admin_token)],
)
async def archive_admin_item(
    item_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.ItemModel:
    return await crud.archive_item(db=db, item_id=item_id)


@app.delete(
    "/admin/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Admin Items"],
    dependencies=[Depends(verify_admin_token)],
)
async def delete_admin_item(
    item_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    await crud.delete_item(db=db, item_id=item_id)


@app.post(
    "/orders/",
    response_model=schemas.OrderRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Orders"],
)
async def create_order(
    order: schemas.OrderCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.OrderModel:
    return await crud.create_order(db=db, order_data=order)


@app.patch(
    "/orders/{order_id}/status",
    response_model=schemas.OrderRead,
    tags=["Orders"],
)
async def change_order_status(
    order_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    new_status: schemas.OrderStatus = Query(
        ...,
        description=(
            "Новый статус заказа: pending, confirmed, delivery, "
            "active, returned, cancelled"
        ),
    ),
) -> models.OrderModel:
    return await crud.update_order_status(
        db=db,
        order_id=order_id,
        new_status=new_status,
    )
