# ПРОКАТило

ПРОКАТило — mobile-first B2C PWA для аренды вещей и техники с доставкой.

## Что входит в проект

- Frontend: Next.js 16.2.4, React 19.2.4, TypeScript
- Backend: FastAPI, async SQLAlchemy, Pydantic
- Миграции: Alembic
- Платежи: YooKassa
- База данных: локальный PostgreSQL в Docker Compose через `DATABASE_URL`
- Запуск: Docker Compose

## Текущее production-окружение на VPS

- Сервер доступен по `193.233.246.61`
- Frontend открыт на `http://193.233.246.61:3000`
- Backend открыт на `http://193.233.246.61:8000`
- Reverse proxy готовит вход через `http://193.233.246.61` и `https://prokatilo.com`
- `prokatilo.com` должен иметь A-запись на `193.233.246.61`
- PostgreSQL запускается локально в compose-сервисе `postgres`
- `CREATE_TABLES_ON_STARTUP=false`
- `ENVIRONMENT=production`
- `ADMIN_API_KEY` не используется, доступ администратора идёт через аккаунты из `ADMIN_EMAILS`

## Локальный запуск без Docker

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend по умолчанию обращается к `http://localhost:8000`. Для переопределения используй `frontend/.env.local` по шаблону `frontend/.env.local.example`.

## Docker Compose

Подготовь env-файлы:

```bash
cp -n backend/.env.example backend/.env
cp -n frontend/.env.local.example frontend/.env.local
```

Заполни `backend/.env` и root `.env`, затем запусти:

```bash
docker compose build
docker compose up
```

Основные compose-сервисы:

```text
postgres  - локальная PostgreSQL БД
backend   - FastAPI API
frontend  - Next.js frontend
caddy     - reverse proxy для /api и frontend
```

Для production root `.env` должен содержать как минимум:

```env
POSTGRES_DB=prokatilo
POSTGRES_USER=prokatilo
POSTGRES_PASSWORD=change-me
NEXT_PUBLIC_API_URL=/api
CORS_ORIGINS=http://193.233.246.61,http://193.233.246.61:3000,https://prokatilo.com,https://www.prokatilo.com
YOOKASSA_RETURN_URL=https://prokatilo.com
```

`backend/.env` хранит секреты приложения: `AUTH_SECRET`, `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`, `ADMIN_EMAILS`. Секреты не коммитятся.

## Аутентификация

- Регистрация: `POST /auth/register`
- Вход: `POST /auth/login`
- Текущий пользователь: `GET /auth/me`

Для production первый админ создаётся через email из `ADMIN_EMAILS`. По умолчанию это `admin@prokatilo.local`.

## Каталог

Public endpoints:

```text
GET /items/
GET /items/available/
GET /items/search/?q=
GET /items/{item_id}
GET /items/{item_id}/bookings?rental_date=YYYY-MM-DD
```

Admin endpoints:

```text
GET /admin/items/
POST /admin/items/
PATCH /admin/items/{item_id}
PATCH /admin/items/{item_id}/availability?is_available=true
PATCH /admin/items/{item_id}/archive
DELETE /admin/items/{item_id}
```

## Заказы

Public and user endpoints:

```text
POST /orders/
GET /orders/{order_id}?customer_phone=
GET /orders/my?customer_phone=
GET /me/orders
```

Бронь хранит строковые поля `rental_date`/`rental_time` для UI и реальные интервалы `rental_start_at`/`rental_end_at` для проверки пересечений.
Товар остаётся в каталоге после бронирования; занятость отображается как временной слот.

Admin endpoints:

```text
GET /admin/orders/
GET /admin/orders/{order_id}
PATCH /admin/orders/{order_id}
PATCH /admin/orders/{order_id}/status?new_status=
```

## Оплата YooKassa

- Инициация оплаты: `POST /orders/{order_id}/payment`
- Webhook: `POST /payments/yookassa/webhook`
- `cash` получает статус `not_required`
- `sbp` и `card` создают платёж YooKassa, если секреты настроены

## Важное

- В корне проекта есть рабочий `README.md`, но фронтенд-README сейчас необходимо полностью заменить, потому что он был шаблоном Next.js и не описывал реальный проект
- Не коммить секреты из `backend/.env`
