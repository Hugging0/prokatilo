import unittest
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app import schemas
from app.main import app
from app.notifications import _run_notification_channel
from app.settings import Settings
from app.telegram_notifications import (
    build_new_order_message,
    handle_telegram_update,
    normalize_telegram_username,
    telegram_command,
)


class TelegramNotificationTests(unittest.TestCase):
    def test_normalizes_allowlist_and_usernames(self) -> None:
        settings = Settings(
            DATABASE_URL="postgresql+asyncpg://test:test@localhost/test",
            TELEGRAM_ALLOWED_USERNAMES=" @Admin_One,admin_two, ",
        )

        self.assertEqual(
            settings.telegram_allowed_username_set,
            {"admin_one", "admin_two"},
        )
        self.assertEqual(normalize_telegram_username("@ADMIN_ONE"), "admin_one")
        self.assertIsNone(normalize_telegram_username(""))

    def test_parses_commands_with_bot_suffix(self) -> None:
        self.assertEqual(telegram_command("/start"), "/start")
        self.assertEqual(
            telegram_command("/START@prokatilo_alerts_bot payload"),
            "/start",
        )
        self.assertIsNone(telegram_command("start"))

    def test_order_message_escapes_customer_content(self) -> None:
        order = SimpleNamespace(
            id=42,
            item=SimpleNamespace(title="Xbox & два геймпада"),
            tariff_type="24h",
            total_price=Decimal("950.00"),
            payment_method="cash",
            rental_date="17.08.2026",
            rental_time="18:00",
            customer_name="Александр <admin>",
            customer_phone="+7 900 000-00-00",
            delivery_address="Москва & область",
            comment="Позвонить > написать",
        )

        message = build_new_order_message(order)

        self.assertIn("Xbox &amp; два геймпада", message)
        self.assertIn("Александр &lt;admin&gt;", message)
        self.assertIn("Москва &amp; область", message)
        self.assertNotIn("<admin>", message)


class TelegramWebhookTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.settings = Settings(
            DATABASE_URL="postgresql+asyncpg://test:test@localhost/test",
            TELEGRAM_BOT_TOKEN="test-token",
            TELEGRAM_WEBHOOK_SECRET="test-secret",
            TELEGRAM_ALLOWED_USERNAMES="admin_one",
        )

    @staticmethod
    def update(username: str | None, text: str = "/start") -> schemas.TelegramUpdate:
        return schemas.TelegramUpdate.model_validate(
            {
                "update_id": 1,
                "message": {
                    "text": text,
                    "from": {"id": 123, "username": username},
                    "chat": {"id": 123, "type": "private"},
                },
            },
        )

    async def test_start_subscribes_allowed_username(self) -> None:
        with (
            patch(
                "app.telegram_notifications._upsert_subscription",
                new_callable=AsyncMock,
            ) as upsert,
            patch(
                "app.telegram_notifications.send_telegram_message",
                new_callable=AsyncMock,
            ) as send_message,
        ):
            await handle_telegram_update(
                settings=self.settings,
                update=self.update("Admin_One"),
            )

        upsert.assert_awaited_once_with(123, 123, "admin_one")
        send_message.assert_awaited_once()

    async def test_start_rejects_username_outside_allowlist(self) -> None:
        with (
            patch(
                "app.telegram_notifications._upsert_subscription",
                new_callable=AsyncMock,
            ) as upsert,
            patch(
                "app.telegram_notifications.send_telegram_message",
                new_callable=AsyncMock,
            ) as send_message,
        ):
            await handle_telegram_update(
                settings=self.settings,
                update=self.update("unknown_user"),
            )

        upsert.assert_not_awaited()
        self.assertIn("нет доступа", send_message.await_args.args[2])

    async def test_notification_channel_failure_is_isolated(self) -> None:
        async def fail() -> None:
            raise RuntimeError("provider unavailable")

        with self.assertLogs("app.notifications", level="ERROR"):
            await _run_notification_channel("telegram", fail())


class TelegramWebhookSecurityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = Settings(
            DATABASE_URL="postgresql+asyncpg://test:test@localhost/test",
            TELEGRAM_BOT_TOKEN="test-token",
            TELEGRAM_WEBHOOK_SECRET="test-secret",
            TELEGRAM_ALLOWED_USERNAMES="admin_one",
        )
        self.payload = {
            "update_id": 1,
            "message": {
                "text": "/start",
                "from": {"id": 123, "username": "admin_one"},
                "chat": {"id": 123, "type": "private"},
            },
        }

    def test_webhook_hides_endpoint_without_valid_secret(self) -> None:
        with (
            patch("app.main.settings", self.settings),
            patch("app.main.handle_telegram_update", new_callable=AsyncMock),
            TestClient(app) as client,
        ):
            response = client.post("/telegram/webhook", json=self.payload)

        self.assertEqual(response.status_code, 404)

    def test_webhook_accepts_valid_telegram_secret(self) -> None:
        with (
            patch("app.main.settings", self.settings),
            patch(
                "app.main.handle_telegram_update",
                new_callable=AsyncMock,
            ) as handle_update,
            TestClient(app) as client,
        ):
            response = client.post(
                "/telegram/webhook",
                json=self.payload,
                headers={"X-Telegram-Bot-Api-Secret-Token": "test-secret"},
            )

        self.assertEqual(response.status_code, 204)
        handle_update.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
