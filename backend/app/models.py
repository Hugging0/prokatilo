from datetime import datetime
from decimal import Decimal
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, Numeric, String, func
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
    price_per_24h: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    price_per_7d: Mapped[Decimal] = mapped_column(Numeric(10, 2))
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
    loyalty_account: Mapped["LoyaltyAccountModel | None"] = relationship(
        back_populates="user",
    )
    push_subscriptions: Mapped[list["PushSubscriptionModel"]] = relationship(
        back_populates="user",
    )


class LoyaltyAccountModel(Base):
    __tablename__ = "loyalty_accounts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    balance: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    lifetime_earned: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    lifetime_spent: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user: Mapped["UserModel"] = relationship(back_populates="loyalty_account")


class PromoCodeModel(Base):
    __tablename__ = "promo_codes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    kind: Mapped[str] = mapped_column(String(50))
    discount_percent: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    discount_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    bonus_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    min_order_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    max_uses: Mapped[int | None] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    max_uses_per_user: Mapped[int] = mapped_column(Integer, default=1)
    valid_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
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

    orders: Mapped[list["OrderModel"]] = relationship(back_populates="promo_code")
    transactions: Mapped[list["LoyaltyTransactionModel"]] = relationship(
        back_populates="promo_code",
    )
    redemptions: Mapped[list["PromoCodeRedemptionModel"]] = relationship(
        back_populates="promo_code",
    )


class LoyaltyTransactionModel(Base):
    __tablename__ = "loyalty_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id"), nullable=True)
    promo_code_id: Mapped[int | None] = mapped_column(
        ForeignKey("promo_codes.id"),
        nullable=True,
    )
    type: Mapped[str] = mapped_column(String(50))
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    description: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    user: Mapped["UserModel"] = relationship()
    order: Mapped["OrderModel | None"] = relationship(back_populates="loyalty_transactions")
    promo_code: Mapped["PromoCodeModel | None"] = relationship(back_populates="transactions")


class PromoCodeRedemptionModel(Base):
    __tablename__ = "promo_code_redemptions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    promo_code_id: Mapped[int] = mapped_column(ForeignKey("promo_codes.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    promo_code: Mapped["PromoCodeModel"] = relationship(back_populates="redemptions")
    user: Mapped["UserModel"] = relationship()
    order: Mapped["OrderModel | None"] = relationship(back_populates="promo_redemptions")


Index(
    "ix_promo_code_redemptions_promo_user",
    PromoCodeRedemptionModel.promo_code_id,
    PromoCodeRedemptionModel.user_id,
)


class ServiceSettingsModel(Base):
    __tablename__ = "service_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    timezone: Mapped[str] = mapped_column(String(100), default="Europe/Moscow")
    workday_start: Mapped[str] = mapped_column(String(5), default="08:00")
    workday_end: Mapped[str] = mapped_column(String(5), default="20:00")
    delivery_slot_minutes: Mapped[int] = mapped_column(Integer, default=120)
    min_order_lead_minutes: Mapped[int] = mapped_column(Integer, default=15)
    support_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    service_is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    service_pause_message: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    cash_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    card_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    sbp_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    default_payment_method: Mapped[str] = mapped_column(String(50), default="cash")
    cashback_percent: Mapped[int] = mapped_column(Integer, default=5)
    max_bonus_spend_percent: Mapped[int] = mapped_column(Integer, default=30)
    bonus_to_ruble_rate: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


class PushSubscriptionModel(Base):
    __tablename__ = "push_subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    endpoint: Mapped[str] = mapped_column(String(2048), unique=True, index=True)
    p256dh: Mapped[str] = mapped_column(String(255))
    auth: Mapped[str] = mapped_column(String(255))
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
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

    user: Mapped["UserModel"] = relationship(back_populates="push_subscriptions")


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
    subtotal_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    promo_code_id: Mapped[int | None] = mapped_column(ForeignKey('promo_codes.id'), nullable=True)
    promo_discount_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    bonus_spent_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    bonus_earned_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    loyalty_processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    status: Mapped[str] = mapped_column(default='pending')
    comment: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    rental_date: Mapped[str] = mapped_column(String(20))
    rental_time: Mapped[str] = mapped_column(String(20))
    rental_start_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    rental_end_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
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
    promo_code: Mapped["PromoCodeModel | None"] = relationship(back_populates="orders")
    loyalty_transactions: Mapped[list["LoyaltyTransactionModel"]] = relationship(
        back_populates="order",
    )
    promo_redemptions: Mapped[list["PromoCodeRedemptionModel"]] = relationship(
        back_populates="order",
    )
