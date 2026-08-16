import asyncio
import sys

import httpx

from app.settings import get_settings


async def configure_webhook() -> None:
    settings = get_settings()
    if not settings.telegram_bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not configured")
    if not settings.telegram_webhook_secret:
        raise RuntimeError("TELEGRAM_WEBHOOK_SECRET is not configured")
    if not settings.telegram_webhook_url:
        raise RuntimeError("TELEGRAM_WEBHOOK_URL is not configured")

    api_root = f"https://api.telegram.org/bot{settings.telegram_bot_token}"
    async with httpx.AsyncClient(timeout=10) as client:
        webhook_response = await client.post(
            f"{api_root}/setWebhook",
            json={
                "url": settings.telegram_webhook_url,
                "secret_token": settings.telegram_webhook_secret,
                "allowed_updates": ["message"],
            },
        )
        webhook_response.raise_for_status()
        webhook_result = webhook_response.json()
        if not webhook_result.get("ok"):
            raise RuntimeError(
                str(webhook_result.get("description") or "setWebhook failed"),
            )

        commands_response = await client.post(
            f"{api_root}/setMyCommands",
            json={
                "commands": [
                    {
                        "command": "start",
                        "description": "Включить уведомления о заказах",
                    },
                    {
                        "command": "stop",
                        "description": "Отключить уведомления",
                    },
                ],
            },
        )
        commands_response.raise_for_status()
        commands_result = commands_response.json()
        if not commands_result.get("ok"):
            raise RuntimeError(
                str(commands_result.get("description") or "setMyCommands failed"),
            )

    print("Telegram webhook and bot commands configured")


if __name__ == "__main__":
    try:
        asyncio.run(configure_webhook())
    except Exception as exc:
        print(f"Telegram setup failed: {type(exc).__name__}", file=sys.stderr)
        raise SystemExit(1) from exc
