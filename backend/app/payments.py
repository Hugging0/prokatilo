from decimal import Decimal
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.settings import Settings


YOOKASSA_API_URL = "https://api.yookassa.ru/v3"


def format_amount(amount: Decimal) -> str:
    return f"{amount:.2f}"


async def create_yookassa_payment(
    *,
    settings: Settings,
    order_id: int,
    amount: Decimal,
    description: str,
) -> dict[str, Any]:
    if not settings.yookassa_is_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Онлайн-оплата временно недоступна",
        )

    payload = {
        "amount": {
            "value": format_amount(amount),
            "currency": "RUB",
        },
        "capture": True,
        "confirmation": {
            "type": "redirect",
            "return_url": settings.yookassa_return_url,
        },
        "description": description[:128],
        "metadata": {
            "order_id": str(order_id),
        },
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            f"{YOOKASSA_API_URL}/payments",
            auth=(settings.yookassa_shop_id or "", settings.yookassa_secret_key or ""),
            headers={
                "Idempotence-Key": f"prokatilo-order-{order_id}",
            },
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Не удалось создать платёж YooKassa",
        )

    return response.json()


async def get_yookassa_payment(
    *,
    settings: Settings,
    payment_id: str,
) -> dict[str, Any]:
    if not settings.yookassa_is_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Онлайн-оплата временно недоступна",
        )

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            f"{YOOKASSA_API_URL}/payments/{payment_id}",
            auth=(settings.yookassa_shop_id or "", settings.yookassa_secret_key or ""),
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Не удалось проверить платёж YooKassa",
        )

    return response.json()
