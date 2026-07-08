# Project context

Дата актуализации: 2026-07-08.

## Назначение

ПРОКАТило — B2C MVP сервиса аренды вещей и техники с доставкой. Сервис централизованно управляет инвентарем, это не peer-to-peer маркетплейс.

## Архитектура

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4.
- Backend: FastAPI, async SQLAlchemy, Pydantic.
- Database: локальный PostgreSQL в Docker Compose.
- Migrations: Alembic.
- Reverse proxy: Caddy, frontend на `/`, backend на `/api/*`.
- Auth: email/password, admin-доступ через пользователей с `is_admin=true`.
- Payments: YooKassa поддержана backend-слоем, текущий MVP может работать с оплатой курьеру.

## Frontend routes

- `/`: server-rendered SEO-главная с интерактивным публичным каталогом.
- `/catalog`, `/catalog/*`, `/rent/*`, `/delivery-area`, `/faq`, `/about`, `/blog/*`: индексируемый SEO-слой.
- `/app`: PWA-приложение с каталогом, checkout, бронями, бонусами, профилем и операторским разделом.
- `/admin`, `/admin-dashboard`: приватные админские/операторские сценарии.
- `/api/*`: backend через Caddy reverse proxy.

## Production services

Compose-сервисы:

- `postgres`: локальная PostgreSQL БД с named volume `postgres_data`;
- `backend`: FastAPI API на внутреннем `backend:8000`, наружу только `127.0.0.1:8000`;
- `frontend`: Next.js standalone server на `frontend:3000`, наружу только `127.0.0.1:3000`;
- `caddy`: публичные `80/443`, reverse proxy и automatic HTTPS.

## Current VPS snapshot

Последняя проверка текущего VPS:

- дата проверки: 2026-07-08;
- production domain: `myprokatilo.ru`;
- проект: `/opt/prokatilo`;
- branch: `sprint-3-payments-vps`;
- production должен быть синхронизирован с GitHub `origin/main`; перед работой сверять `git rev-parse HEAD` на VPS и `git ls-remote origin refs/heads/main`;
- `backend` и `postgres` healthy, `frontend` и `caddy` running;
- `backend/.env` является runtime-файлом и не должен попадать в git;
- Caddy перенаправляет `www.myprokatilo.ru` на root-домен.

## Production rules

- Schema changes только через Alembic migrations.
- `CREATE_TABLES_ON_STARTUP=false` в production.
- `NEXT_PUBLIC_API_URL=/api` в production.
- `DATABASE_URL` для compose production формируется в `docker-compose.yml`.
- Секреты хранятся только в runtime env-файлах на сервере.
- Повторный deploy выполняется через `scripts/prod/deploy.sh`.
- Smoke-test выполняется через `scripts/prod/smoke-test.sh`.

## Main API areas

- Auth: `/auth/register`, `/auth/login`, `/auth/me`.
- Public items: `/items/`, `/items/available/`, `/items/search/`, `/items/{item_id}`, `/items/{item_id}/bookings`.
- Orders: `/orders/`, `/orders/{order_id}`, `/orders/my`, `/me/orders`.
- Admin: `/admin/items/*`, `/admin/orders/*`, `/admin/promo-codes/*`, `/admin/settings/service`.
- Payments: `/orders/{order_id}/payment`, `/payments/yookassa/webhook`.

## Booking model

- Заказы хранят реальные интервалы `rental_start_at` и `rental_end_at`.
- Бронь блокирует только выбранный временной интервал конкретного товара.
- `returned` и `cancelled` не блокируют слот.
- `is_available` — ручная техническая доступность товара, не индикатор занятости по календарю.
- Актуальные тарифы товара: 3 часа, день, неделя.
- `price_per_6h` удален из актуальной продуктовой модели и не должен возвращаться в UI/API без отдельного решения.

## SEO and PWA model

- Индексируемый сайт отделен от приложения: SEO-страницы server-rendered, PWA начинается на `/app`.
- `manifest.ts` использует `start_url=/app`, scope `/`.
- `sitemap.ts` включает публичные SEO-страницы и не включает приватные PWA/admin/API routes.
- `robots.ts` разрешает публичный SEO-слой и закрывает приватные/служебные routes.
- `llms.txt` и `llms-full.txt` отдают краткое и расширенное описание сервиса для LLM-поиска.

## Documentation map

- `docs/agent-handbook.md`: быстрый вход для нового LLM-агента.
- `docs/deployment.md`: production bootstrap/deploy/smoke-test.
- `docs/environment.md`: env-файлы и секреты.
- `docs/context-ignore.md`: файлы и папки, которые не нужно грузить в контекст.
- `frontend/docs/*`: frontend architecture, UI style, refactoring/code rules.
- `AI_RULES.md`: мастер-правила работы с проектом.
