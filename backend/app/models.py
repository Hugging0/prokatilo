from datetime import datetime
from decimal import Decimal
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class ItemModel(Base):
    __tablename__ = 'items'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(String(1000))
    category: Mapped[str] = mapped_column(String(100), default="Техника")
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    icon_key: Mapped[str] = mapped_column(String(50), default="package")
    sort_order: Mapped[int] = mapped_column(Integer, default=100)
    price_per_3h: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    price_per_6h: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    price_per_24h: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    orders: Mapped[list["OrderModel"]] = relationship(back_populates="item")


class UserModel(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    orders: Mapped[list["OrderModel"]] = relationship(back_populates="user")


class OrderModel(Base):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    item_id: Mapped[int] = mapped_column(ForeignKey('items.id'))
    user_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'), nullable=True)
    customer_login: Mapped[str] = mapped_column(String(255))
    customer_name: Mapped[str] = mapped_column(String(255), default="Клиент")
    customer_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_phone: Mapped[str] = mapped_column(String(50))
    delivery_address: Mapped[str] = mapped_column(String(500))
    payment_method: Mapped[str] = mapped_column(String(50), default="cash")
    payment_status: Mapped[str] = mapped_column(String(50), default="pending")
    yookassa_payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    yookassa_confirmation_url: Mapped[str | None] = mapped_column(
        String(2048),
        nullable=True,
    )
    tariff_type: Mapped[str] = mapped_column(String(50))
    total_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(default='pending')
    comment: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    rental_date: Mapped[str] = mapped_column(String(20))
    rental_time: Mapped[str] = mapped_column(String(20))
    rental_start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    rental_end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    item: Mapped["ItemModel"] = relationship(back_populates="orders")
    user: Mapped["UserModel | None"] = relationship(back_populates="orders")
