# Telegram notifications for new orders

The bot delivers new-order alerts to private Telegram chats. A recipient is
accepted only when their current Telegram username is present in the server-side
allowlist.

## Configuration

Set these values in `backend/.env` without committing the real secrets:

```dotenv
TELEGRAM_BOT_TOKEN=<token from BotFather>
TELEGRAM_WEBHOOK_SECRET=<random secret>
TELEGRAM_WEBHOOK_URL=https://myprokatilo.ru/api/telegram/webhook
TELEGRAM_ALLOWED_USERNAMES=admin_one,admin_two
TELEGRAM_ADMIN_APP_URL=https://myprokatilo.ru/app
```

Usernames are case-insensitive and can be written with or without `@`.

After deploying the migration and backend, register the webhook once:

```bash
docker compose exec -T backend python -m scripts.configure_telegram_webhook
```

Each allowed administrator opens `@prokatilo_alerts_bot` and presses Start.
`/stop` disables that chat. Before each order alert, the backend calls `getChat`
and verifies that the account's current username is still allowed.

Order creation commits before a background notification task starts. Web Push
and Telegram run independently, so a provider failure cannot reject or roll back
an order.
