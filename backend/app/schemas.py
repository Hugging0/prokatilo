from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class TariffType(StrEnum):
    THREE_HOURS = "3h"
    TWENTY_FOUR_HOURS = "24h"
    SEVEN_DAYS = "7d"


class PaymentMethod(StrEnum):
    SBP = "sbp"
    CARD = "card"
    CASH = "cash"


class PaymentStatus(StrEnum):
    PENDING = "pending"
    WAITING_FOR_CAPTURE = "waiting_for_capture"
    SUCCEEDED = "succeeded"
    CANCELED = "canceled"
    NOT_REQUIRED = "not_required"


class OrderStatus(StrEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DELIVERY = "delivery"
    ACTIVE = "active"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class PromoCodeKind(StrEnum):
    PERCENT_DISCOUNT = "percent_discount"
    FIXED_DISCOUNT = "fixed_discount"
    BONUS_CREDIT = "bonus_credit"


class LoyaltyTransactionType(StrEnum):
    EARNED = "earned"
    SPENT = "spent"
    PROMO_CREDIT = "promo_credit"
    REFUND = "refund"
    ADJUSTMENT = "adjustment"


class ItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=2000)
    category: str = Field(default="Техника", min_length=1, max_length=100)
    price_per_3h: Decimal = Field(..., ge=0)
    price_per_24h: Decimal = Field(..., ge=0)
    price_per_7d: Decimal = Field(..., ge=0)
    image_url: str | None = Field(None, max_length=2048)
    icon_key: str = Field(default="package", min_length=1, max_length=50)
    sort_order: int = Field(default=100, ge=0)
    is_available: bool = True
    is_active: bool = True


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=2000)
    category: str | None = Field(None, min_length=1, max_length=100)
    price_per_3h: Decimal | None = Field(None, ge=0)
    price_per_24h: Decimal | None = Field(None, ge=0)
    price_per_7d: Decimal | None = Field(None, ge=0)
    image_url: str | None = Field(None, max_length=2048)
    icon_key: str | None = Field(None, min_length=1, max_length=50)
    sort_order: int | None = Field(None, ge=0)
    is_available: bool | None = None
    is_active: bool | None = None


class ItemRead(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminItemRead(ItemRead):
    pass


class UserRead(BaseModel):
    id: int
    email: str
    name: str
    phone: str | None
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)


class AuthRegister(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    name: str = Field(..., min_length=1, max_length=100)
    phone: str | None = Field(None, min_length=3, max_length=50)


class AuthLogin(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class AuthRead(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class WebPushPublicKeyRead(BaseModel):
    public_key: str | None
    is_configured: bool


class PushSubscriptionKeys(BaseModel):
    p256dh: str = Field(..., min_length=1, max_length=255)
    auth: str = Field(..., min_length=1, max_length=255)


class PushSubscriptionCreate(BaseModel):
    endpoint: str = Field(..., min_length=1, max_length=2048)
    keys: PushSubscriptionKeys


class PushSubscriptionDelete(BaseModel):
    endpoint: str = Field(..., min_length=1, max_length=2048)


class PushSubscriptionRead(BaseModel):
    id: int
    endpoint: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class OrderBase(BaseModel):
    item_id: int = Field(..., gt=0)
    customer_name: str = Field(..., min_length=1, max_length=100)
    customer_email: str | None = Field(None, max_length=255)
    customer_phone: str = Field(..., min_length=3, max_length=50)
    delivery_address: str = Field(..., min_length=5, max_length=500)
    payment_method: PaymentMethod
    tariff_type: TariffType
    total_price: Decimal = Field(..., ge=0)
    rental_date: str = Field(..., min_length=1, max_length=20)
    rental_time: str = Field(..., min_length=1, max_length=20)
    rental_end_date: str | None = Field(None, min_length=1, max_length=20)
    rental_end_time: str | None = Field(None, min_length=1, max_length=20)
    comment: str | None = Field(None, max_length=1000)


class OrderCreate(OrderBase):
    promo_code: str | None = Field(None, max_length=50)
    bonus_spend_amount: Decimal | None = Field(None, ge=0)


class OrderUpdate(BaseModel):
    customer_name: str | None = Field(None, min_length=1, max_length=100)
    customer_email: str | None = Field(None, max_length=255)
    customer_phone: str | None = Field(None, min_length=3, max_length=50)
    delivery_address: str | None = Field(None, min_length=5, max_length=500)
    payment_method: PaymentMethod | None = None
    tariff_type: TariffType | None = None
    total_price: Decimal | None = Field(None, ge=0)
    rental_date: str | None = Field(None, min_length=1, max_length=20)
    rental_time: str | None = Field(None, min_length=1, max_length=20)
    rental_end_date: str | None = Field(None, min_length=1, max_length=20)
    rental_end_time: str | None = Field(None, min_length=1, max_length=20)
    comment: str | None = Field(None, max_length=1000)


class OrderStatusUpdate(BaseModel):
    new_status: OrderStatus


class OrderAddressUpdate(BaseModel):
    delivery_address: str = Field(..., min_length=5, max_length=500)


class BookingRead(BaseModel):
    order_id: int
    item_id: int
    rental_start_at: datetime
    rental_end_at: datetime
    status: OrderStatus

    model_config = ConfigDict(from_attributes=True)


class DeliveryEstimateRead(BaseModel):
    kind: str
    title: str
    price_label: str
    description: str
    short_note: str
    is_exact_free: bool
    needs_operator_confirmation: bool
    distance_m: int | None = None
    matched_address: str | None = None


class LoyaltyAccountRead(BaseModel):
    balance: Decimal
    lifetime_earned: Decimal
    lifetime_spent: Decimal

    model_config = ConfigDict(from_attributes=True)


class LoyaltyTransactionRead(BaseModel):
    id: int
    type: LoyaltyTransactionType
    amount: Decimal
    description: str
    order_id: int | None
    promo_code_id: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoyaltySummaryRead(BaseModel):
    account: LoyaltyAccountRead
    recent_transactions: list[LoyaltyTransactionRead]
    cashback_percent: int = 5
    bonus_to_ruble_rate: int = 1
    max_bonus_spend_percent: int = 30


class PromoCodeCreate(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(None, max_length=500)
    kind: PromoCodeKind
    discount_percent: Decimal | None = Field(None, ge=0, le=100)
    discount_amount: Decimal | None = Field(None, ge=0)
    bonus_amount: Decimal | None = Field(None, ge=0)
    min_order_amount: Decimal | None = Field(None, ge=0)
    max_uses: int | None = Field(None, ge=1)
    max_uses_per_user: int = Field(default=1, ge=1)
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    is_active: bool = True


class PromoCodeUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = Field(None, max_length=500)
    discount_percent: Decimal | None = Field(None, ge=0, le=100)
    discount_amount: Decimal | None = Field(None, ge=0)
    bonus_amount: Decimal | None = Field(None, ge=0)
    min_order_amount: Decimal | None = Field(None, ge=0)
    max_uses: int | None = Field(None, ge=1)
    max_uses_per_user: int | None = Field(None, ge=1)
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    is_active: bool | None = None


class PromoCodeRead(BaseModel):
    id: int
    code: str
    title: str
    description: str | None
    kind: PromoCodeKind
    discount_percent: Decimal | None
    discount_amount: Decimal | None
    bonus_amount: Decimal | None
    min_order_amount: Decimal | None
    max_uses: int | None
    used_count: int
    max_uses_per_user: int
    valid_from: datetime | None
    valid_until: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PromoCodePreviewRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    subtotal_price: Decimal = Field(..., ge=0)


class PromoCodePreviewRead(BaseModel):
    code: str
    title: str
    description: str | None
    kind: PromoCodeKind
    discount_amount: Decimal
    bonus_amount: Decimal
    message: str


class PromoCodeActivateRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)


class PromoCodeActivateRead(BaseModel):
    balance: Decimal
    credited_amount: Decimal
    message: str


class ServiceSettingsUpdate(BaseModel):
    timezone: str | None = Field(None, min_length=1, max_length=100)
    workday_start: str | None = Field(None, pattern=r"^\d{2}:\d{2}$")
    workday_end: str | None = Field(None, pattern=r"^\d{2}:\d{2}$")
    delivery_slot_minutes: int | None = Field(None, ge=15, le=240)
    min_order_lead_minutes: int | None = Field(None, ge=0, le=1440)
    support_phone: str | None = Field(None, max_length=50)
    service_is_active: bool | None = None
    service_pause_message: str | None = Field(None, max_length=500)
    cash_enabled: bool | None = None
    card_enabled: bool | None = None
    sbp_enabled: bool | None = None
    default_payment_method: PaymentMethod | None = None
    cashback_percent: int | None = Field(None, ge=0, le=100)
    max_bonus_spend_percent: int | None = Field(None, ge=0, le=100)
    bonus_to_ruble_rate: int | None = Field(None, ge=1, le=100)


class ServiceSettingsRead(BaseModel):
    id: int
    timezone: str
    workday_start: str
    workday_end: str
    delivery_slot_minutes: int
    min_order_lead_minutes: int
    support_phone: str | None
    service_is_active: bool
    service_pause_message: str | None
    cash_enabled: bool
    card_enabled: bool
    sbp_enabled: bool
    default_payment_method: PaymentMethod
    cashback_percent: int
    max_bonus_spend_percent: int
    bonus_to_ruble_rate: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PublicServiceSettingsRead(BaseModel):
    timezone: str
    workday_start: str
    workday_end: str
    delivery_slot_minutes: int
    min_order_lead_minutes: int
    support_phone: str | None
    service_is_active: bool
    service_pause_message: str | None
    cash_enabled: bool
    card_enabled: bool
    sbp_enabled: bool
    default_payment_method: PaymentMethod
    cashback_percent: int
    max_bonus_spend_percent: int
    bonus_to_ruble_rate: int

    model_config = ConfigDict(from_attributes=True)


class OrderRead(OrderBase):
    id: int
    user_id: int | None
    customer_login: str
    status: OrderStatus
    payment_status: PaymentStatus
    yookassa_payment_id: str | None
    yookassa_confirmation_url: str | None
    subtotal_price: Decimal
    promo_code: PromoCodeRead | None
    promo_discount_amount: Decimal
    bonus_spent_amount: Decimal
    bonus_earned_amount: Decimal
    rental_start_at: datetime | None
    rental_end_at: datetime | None
    created_at: datetime
    updated_at: datetime
    item: AdminItemRead

    model_config = ConfigDict(from_attributes=True)


class AdminOrderRead(OrderRead):
    pass


class PaymentRead(BaseModel):
    order_id: int
    payment_status: PaymentStatus
    provider_payment_id: str | None
    confirmation_url: str | None


class HealthRead(BaseModel):
    status: str
    service: str
