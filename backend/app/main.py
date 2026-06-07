from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, models, schemas
from app.auth import create_access_token, parse_access_token
from app.database import Base, engine, get_db
from app.payments import create_yookassa_payment, get_yookassa_payment
from app.settings import get_settings


settings = get_settings()
bearer_scheme = HTTPBearer(auto_error=False)


async def get_optional_current_user(
    db: Annotated[AsyncSession, Depends(get_db)],
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ] = None,
) -> models.UserModel | None:
    if not credentials:
        return None

    token_payload = parse_access_token(
        credentials.credentials,
        settings.auth_secret,
    )

    if not token_payload:
        return None

    user = await db.get(models.UserModel, token_payload.user_id)

    if not user or not user.is_active:
        return None

    return user


async def get_current_user(
    user: Annotated[
        models.UserModel | None,
        Depends(get_optional_current_user),
    ],
) -> models.UserModel:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительная сессия",
        )

    return user


async def verify_admin_access(
    current_user: Annotated[
        models.UserModel | None,
        Depends(get_optional_current_user),
    ] = None,
    x_admin_token: Annotated[str | None, Header()] = None,
) -> None:
    if current_user and current_user.is_admin:
        return

    if not settings.admin_api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нужен аккаунт администратора",
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
    root_path=settings.api_root_path,
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


@app.post(
    "/auth/register",
    response_model=schemas.AuthRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Auth"],
)
async def register(
    payload: schemas.AuthRegister,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> schemas.AuthRead:
    user = await crud.create_user(
        db=db,
        user_data=payload,
        is_admin=payload.email.lower() in settings.admin_email_set,
    )
    return schemas.AuthRead(
        access_token=create_access_token(user.id, settings.auth_secret),
        user=user,
    )


@app.post(
    "/auth/login",
    response_model=schemas.AuthRead,
    tags=["Auth"],
)
async def login(
    payload: schemas.AuthLogin,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> schemas.AuthRead:
    user = await crud.authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )
    return schemas.AuthRead(
        access_token=create_access_token(user.id, settings.auth_secret),
        user=user,
    )


@app.get(
    "/auth/me",
    response_model=schemas.UserRead,
    tags=["Auth"],
)
async def read_me(
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
) -> models.UserModel:
    return current_user


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
    "/items/{item_id}/bookings",
    response_model=list[schemas.BookingRead],
    tags=["Items"],
)
async def read_item_bookings(
    item_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    rental_date: str | None = Query(default=None),
) -> list[schemas.BookingRead]:
    bookings = await crud.get_item_bookings(
        db=db,
        item_id=item_id,
        rental_date=rental_date,
    )
    booking_reads: list[schemas.BookingRead] = []

    for booking in bookings:
        rental_start_at, rental_end_at = crud.get_order_blocking_interval(booking)
        booking_reads.append(
            schemas.BookingRead(
                order_id=booking.id,
                item_id=booking.item_id,
                rental_start_at=rental_start_at,
                rental_end_at=rental_end_at,
                status=schemas.OrderStatus(booking.status),
            ),
        )

    return booking_reads


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
    dependencies=[Depends(verify_admin_access)],
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
    dependencies=[Depends(verify_admin_access)],
)
async def read_admin_items(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[models.ItemModel]:
    return await crud.get_admin_items(db)


@app.patch(
    "/admin/items/{item_id}",
    response_model=schemas.AdminItemRead,
    tags=["Admin Items"],
    dependencies=[Depends(verify_admin_access)],
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
    dependencies=[Depends(verify_admin_access)],
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
    dependencies=[Depends(verify_admin_access)],
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
    dependencies=[Depends(verify_admin_access)],
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
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
) -> models.OrderModel:
    return await crud.create_order(
        db=db,
        order_data=order,
        user=current_user,
    )


def map_yookassa_payment_status(status_value: str) -> schemas.PaymentStatus:
    match status_value:
        case "succeeded":
            return schemas.PaymentStatus.SUCCEEDED
        case "waiting_for_capture":
            return schemas.PaymentStatus.WAITING_FOR_CAPTURE
        case "canceled":
            return schemas.PaymentStatus.CANCELED
        case _:
            return schemas.PaymentStatus.PENDING


@app.post(
    "/orders/{order_id}/payment",
    response_model=schemas.PaymentRead,
    tags=["Payments"],
)
async def create_order_payment(
    order_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
) -> schemas.PaymentRead:
    order = await crud.get_order_for_user(
        db=db,
        order_id=order_id,
        user_id=current_user.id,
    )

    if order.payment_method == schemas.PaymentMethod.CASH.value:
        return schemas.PaymentRead(
            order_id=order.id,
            payment_status=schemas.PaymentStatus.NOT_REQUIRED,
            provider_payment_id=None,
            confirmation_url=None,
        )

    if order.payment_status == schemas.PaymentStatus.SUCCEEDED.value:
        return schemas.PaymentRead(
            order_id=order.id,
            payment_status=schemas.PaymentStatus.SUCCEEDED,
            provider_payment_id=order.yookassa_payment_id,
            confirmation_url=None,
        )

    if order.yookassa_payment_id and order.yookassa_confirmation_url:
        return schemas.PaymentRead(
            order_id=order.id,
            payment_status=schemas.PaymentStatus(order.payment_status),
            provider_payment_id=order.yookassa_payment_id,
            confirmation_url=order.yookassa_confirmation_url,
        )

    payment = await create_yookassa_payment(
        settings=settings,
        order_id=order.id,
        amount=order.total_price,
        description=f"Бронь ПРОКАТило №{order.id}",
    )
    confirmation = payment.get("confirmation") or {}
    payment_status = map_yookassa_payment_status(str(payment.get("status", "")))

    updated_order = await crud.attach_order_payment(
        db=db,
        order_id=order.id,
        payment_id=str(payment.get("id")),
        confirmation_url=confirmation.get("confirmation_url"),
        payment_status=payment_status,
    )

    return schemas.PaymentRead(
        order_id=updated_order.id,
        payment_status=schemas.PaymentStatus(updated_order.payment_status),
        provider_payment_id=updated_order.yookassa_payment_id,
        confirmation_url=updated_order.yookassa_confirmation_url,
    )


@app.post(
    "/payments/yookassa/webhook",
    tags=["Payments"],
)
async def yookassa_webhook(
    payload: dict,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    payment_object = payload.get("object") or {}
    payment_id = payment_object.get("id")

    if not payment_id:
        return {"status": "ignored"}

    verified_payment = await get_yookassa_payment(
        settings=settings,
        payment_id=str(payment_id),
    )
    payment_status = map_yookassa_payment_status(
        str(verified_payment.get("status", "")),
    )

    await crud.update_order_payment_status(
        db=db,
        payment_id=str(payment_id),
        payment_status=payment_status,
    )

    return {"status": "ok"}


@app.get(
    "/me/orders",
    response_model=list[schemas.OrderRead],
    tags=["Orders"],
)
async def read_account_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
) -> list[models.OrderModel]:
    return await crud.get_orders_by_user(db=db, user_id=current_user.id)


@app.get(
    "/me/loyalty",
    response_model=schemas.LoyaltySummaryRead,
    tags=["Loyalty"],
)
async def read_loyalty_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
) -> schemas.LoyaltySummaryRead:
    return await crud.get_loyalty_summary(db=db, user_id=current_user.id)


@app.get(
    "/me/loyalty/transactions",
    response_model=list[schemas.LoyaltyTransactionRead],
    tags=["Loyalty"],
)
async def read_loyalty_transactions(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
    limit: int = Query(default=50, ge=1, le=100),
) -> list[models.LoyaltyTransactionModel]:
    return await crud.list_loyalty_transactions(
        db=db,
        user_id=current_user.id,
        limit=limit,
    )


@app.post(
    "/me/promo-codes/preview",
    response_model=schemas.PromoCodePreviewRead,
    tags=["Promo Codes"],
)
async def preview_account_promo_code(
    payload: schemas.PromoCodePreviewRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
) -> schemas.PromoCodePreviewRead:
    return await crud.preview_promo_code(
        db=db,
        user_id=current_user.id,
        code=payload.code,
        subtotal_price=payload.subtotal_price,
    )


@app.post(
    "/me/promo-codes/activate",
    response_model=schemas.PromoCodeActivateRead,
    tags=["Promo Codes"],
)
async def activate_account_promo_code(
    payload: schemas.PromoCodeActivateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
) -> schemas.PromoCodeActivateRead:
    return await crud.redeem_bonus_credit_promo(
        db=db,
        user_id=current_user.id,
        code=payload.code,
    )


@app.patch(
    "/me/orders/{order_id}/address",
    response_model=schemas.OrderRead,
    tags=["Orders"],
)
async def update_account_order_address(
    order_id: int,
    payload: schemas.OrderAddressUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
) -> models.OrderModel:
    return await crud.update_user_order_address(
        db=db,
        order_id=order_id,
        user_id=current_user.id,
        delivery_address=payload.delivery_address,
    )


@app.patch(
    "/me/orders/{order_id}/cancel",
    response_model=schemas.OrderRead,
    tags=["Orders"],
)
async def cancel_account_order(
    order_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[models.UserModel, Depends(get_current_user)],
) -> models.OrderModel:
    return await crud.cancel_user_order(
        db=db,
        order_id=order_id,
        user_id=current_user.id,
    )


@app.get(
    "/orders/my",
    response_model=list[schemas.OrderRead],
    tags=["Orders"],
)
async def read_my_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    customer_phone: str = Query(
        ...,
        min_length=3,
        description="Телефон клиента, который использовался при создании брони",
    ),
) -> list[models.OrderModel]:
    return await crud.get_orders_by_customer_phone(
        db=db,
        customer_phone=customer_phone,
    )


@app.get(
    "/orders/{order_id}",
    response_model=schemas.OrderRead,
    tags=["Orders"],
)
async def read_order(
    order_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    customer_phone: str = Query(..., min_length=3),
) -> models.OrderModel:
    order = await crud.get_order_by_id(db, order_id)

    if order.customer_phone != customer_phone:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Заказ недоступен для этого клиента",
        )

    return order


@app.get(
    "/admin/orders/",
    response_model=list[schemas.AdminOrderRead],
    tags=["Admin Orders"],
    dependencies=[Depends(verify_admin_access)],
)
async def read_admin_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: schemas.OrderStatus | None = Query(default=None),
) -> list[models.OrderModel]:
    return await crud.get_admin_orders(
        db=db,
        status_filter=status_filter,
    )


@app.get(
    "/admin/promo-codes/",
    response_model=list[schemas.PromoCodeRead],
    tags=["Admin Promo Codes"],
    dependencies=[Depends(verify_admin_access)],
)
async def read_admin_promo_codes(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[models.PromoCodeModel]:
    return await crud.list_promo_codes(db=db)


@app.post(
    "/admin/promo-codes/",
    response_model=schemas.PromoCodeRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Promo Codes"],
    dependencies=[Depends(verify_admin_access)],
)
async def create_admin_promo_code(
    payload: schemas.PromoCodeCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.PromoCodeModel:
    return await crud.create_promo_code(db=db, payload=payload)


@app.patch(
    "/admin/promo-codes/{promo_code_id}",
    response_model=schemas.PromoCodeRead,
    tags=["Admin Promo Codes"],
    dependencies=[Depends(verify_admin_access)],
)
async def update_admin_promo_code(
    promo_code_id: int,
    payload: schemas.PromoCodeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.PromoCodeModel:
    return await crud.update_promo_code(
        db=db,
        promo_code_id=promo_code_id,
        payload=payload,
    )


@app.patch(
    "/admin/promo-codes/{promo_code_id}/archive",
    response_model=schemas.PromoCodeRead,
    tags=["Admin Promo Codes"],
    dependencies=[Depends(verify_admin_access)],
)
async def archive_admin_promo_code(
    promo_code_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.PromoCodeModel:
    return await crud.archive_promo_code(db=db, promo_code_id=promo_code_id)


@app.get(
    "/admin/settings/service",
    response_model=schemas.ServiceSettingsRead,
    tags=["Admin Settings"],
    dependencies=[Depends(verify_admin_access)],
)
async def read_admin_service_settings(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.ServiceSettingsModel:
    return await crud.get_service_settings(db=db)


@app.patch(
    "/admin/settings/service",
    response_model=schemas.ServiceSettingsRead,
    tags=["Admin Settings"],
    dependencies=[Depends(verify_admin_access)],
)
async def update_admin_service_settings(
    payload: schemas.ServiceSettingsUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.ServiceSettingsModel:
    return await crud.update_service_settings(db=db, payload=payload)


@app.get(
    "/admin/orders/{order_id}",
    response_model=schemas.AdminOrderRead,
    tags=["Admin Orders"],
    dependencies=[Depends(verify_admin_access)],
)
async def read_admin_order(
    order_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.OrderModel:
    return await crud.get_order_by_id(db, order_id)


@app.patch(
    "/admin/orders/{order_id}",
    response_model=schemas.AdminOrderRead,
    tags=["Admin Orders"],
    dependencies=[Depends(verify_admin_access)],
)
async def update_admin_order(
    order_id: int,
    order_update: schemas.OrderUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> models.OrderModel:
    return await crud.update_order(
        db=db,
        order_id=order_id,
        order_data=order_update,
    )


@app.patch(
    "/admin/orders/{order_id}/status",
    response_model=schemas.AdminOrderRead,
    tags=["Admin Orders"],
    dependencies=[Depends(verify_admin_access)],
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
