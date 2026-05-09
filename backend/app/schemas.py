from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from decimal import Decimal

# --- СХЕМЫ ДЛЯ ТОВАРОВ ---

class ItemBase(BaseModel):
    title: str = Field(..., max_length=100)
    description: str | None = Field(None, max_length=1000)
    price_per_3h: Decimal = Field(..., ge=0)
    price_per_6h: Decimal = Field(..., ge=0)
    price_per_24h: Decimal = Field(..., ge=0)
    is_available: bool = True

class ItemCreate(ItemBase):
    pass # Все поля из Base нужны при создании

class ItemRead(ItemBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# --- СХЕМЫ ДЛЯ ЗАКАЗОВ ---

class OrderBase(BaseModel):
    item_id: int
    customer_login: str = Field(..., max_length=100) # Исправили имя
    customer_phone: str = Field(..., max_length=50) # Простой str или спец. тип
    tariff_type: str = Field(..., max_length=50)
    total_price: Decimal = Field(..., ge=0)

class OrderCreate(OrderBase):
    pass

class OrderRead(OrderBase):
    id: int
    status: str # Добавили статус, который есть в модели
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)





