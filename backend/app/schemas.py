from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class TariffType(StrEnum):
    THREE_HOURS = "3h"
    SIX_HOURS = "6h"
    TWENTY_FOUR_HOURS = "24h"


class OrderStatus(StrEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DELIVERY = "delivery"
    ACTIVE = "active"
    RETURNED = "returned"
    CANCELLED = "cancelled"


class ItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=2000)
    category: str = Field(default="Техника", min_length=1, max_length=100)
    price_per_3h: Decimal = Field(..., ge=0)
    price_per_6h: Decimal = Field(..., ge=0)
    price_per_24h: Decimal = Field(..., ge=0)
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
    price_per_6h: Decimal | None = Field(None, ge=0)
    price_per_24h: Decimal | None = Field(None, ge=0)
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


class OrderBase(BaseModel):
    item_id: int = Field(..., gt=0)
    customer_login: str = Field(..., min_length=1, max_length=100)
    customer_phone: str = Field(..., min_length=3, max_length=50)
    tariff_type: TariffType
    total_price: Decimal = Field(..., ge=0)


class OrderCreate(OrderBase):
    pass


class OrderRead(OrderBase):
    id: int
    status: OrderStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HealthRead(BaseModel):
    status: str
    service: str
