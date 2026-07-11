from __future__ import annotations

import asyncio
import sys
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.auth import hash_password
from app.database import SessionLocal
from app.models import ItemModel, UserModel


LOCAL_USERS = [
    {
        "email": "admin@prokatilo.local",
        "password": "admin123",
        "name": "Локальный админ",
        "phone": "+7 999 000-00-01",
        "is_admin": True,
    },
    {
        "email": "client@prokatilo.local",
        "password": "client123",
        "name": "Тестовый клиент",
        "phone": "+7 999 000-00-02",
        "is_admin": False,
    },
]


LOCAL_ITEMS = [
    {
        "title": "PlayStation 5",
        "description": "Игровая приставка для вечера дома. В комплекте два геймпада.",
        "category": "Игры",
        "price_per_3h": Decimal("1000"),
        "price_per_24h": Decimal("1500"),
        "price_per_7d": Decimal("4500"),
        "image_url": "/uploads/catalog/items/transparent/playstation-5.webp",
        "icon_key": "gamepad",
        "sort_order": 10,
    },
    {
        "title": "PlayStation VR",
        "description": "VR-комплект для игрового вечера и первого знакомства с VR.",
        "category": "Игры",
        "price_per_3h": Decimal("900"),
        "price_per_24h": Decimal("1500"),
        "price_per_7d": Decimal("3500"),
        "image_url": "/uploads/catalog/items/transparent/vr-headset.webp",
        "icon_key": "gamepad",
        "sort_order": 20,
    },
    {
        "title": "Робот-мойщик окон",
        "description": "Помогает быстро помыть окна, лоджию и труднодоступные стекла.",
        "category": "Уборка",
        "price_per_3h": Decimal("700"),
        "price_per_24h": Decimal("1200"),
        "price_per_7d": Decimal("3000"),
        "image_url": "/uploads/catalog/items/transparent/domashi-window-cleaner.webp",
        "icon_key": "sparkles",
        "sort_order": 30,
    },
    {
        "title": "Моющий пылесос для мебели",
        "description": "Для чистки дивана, кресел, матраса или салона автомобиля.",
        "category": "Уборка",
        "price_per_3h": Decimal("800"),
        "price_per_24h": Decimal("1300"),
        "price_per_7d": Decimal("3200"),
        "image_url": "/uploads/catalog/items/transparent/komiko-extractor.webp",
        "icon_key": "vacuum",
        "sort_order": 40,
    },
]


async def upsert_user(user_data: dict[str, object]) -> None:
    async with SessionLocal() as db:
        result = await db.execute(
            select(UserModel).where(UserModel.email == user_data["email"]),
        )
        user = result.scalar_one_or_none()

        if user:
            user.name = str(user_data["name"])
            user.phone = str(user_data["phone"])
            user.is_admin = bool(user_data["is_admin"])
            user.is_active = True
        else:
            user = UserModel(
                email=str(user_data["email"]),
                password_hash=hash_password(str(user_data["password"])),
                name=str(user_data["name"]),
                phone=str(user_data["phone"]),
                is_admin=bool(user_data["is_admin"]),
                is_active=True,
            )
            db.add(user)

        await db.commit()


async def upsert_item(item_data: dict[str, object]) -> None:
    async with SessionLocal() as db:
        result = await db.execute(
            select(ItemModel).where(ItemModel.title == item_data["title"]),
        )
        item = result.scalar_one_or_none()

        if item:
            for key, value in item_data.items():
                setattr(item, key, value)
            item.is_available = True
            item.is_active = True
        else:
            item = ItemModel(
                **item_data,
                is_available=True,
                is_active=True,
            )
            db.add(item)

        await db.commit()


async def main() -> None:
    for user_data in LOCAL_USERS:
        await upsert_user(user_data)

    for item_data in LOCAL_ITEMS:
        await upsert_item(item_data)

    print("Local seed data is ready.")
    print("Admin: admin@prokatilo.local / admin123")
    print("Client: client@prokatilo.local / client123")


if __name__ == "__main__":
    asyncio.run(main())
