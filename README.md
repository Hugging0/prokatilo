# ПРОКАТило

ПРОКАТило — mobile-first B2C PWA для централизованной аренды вещей и техники с доставкой за 15 минут и без залога.

## Стек

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS.
- Backend: FastAPI, async SQLAlchemy, Pydantic.
- Database migrations: Alembic.
- Runtime packaging: Docker и Docker Compose.

## Локальный Запуск Без Docker

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

Frontend по умолчанию ходит к `http://localhost:8000`. Для переопределения используй `frontend/.env.local` по шаблону `frontend/.env.local.example`.

Email-авторизация:

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secret123",
    "name": "Александр",
    "phone": "+79990000000"
  }'
```

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'
```

## Production-Like Запуск Через Docker Compose

Подготовь env:

```bash
cp -n backend/.env.example backend/.env
cp -n frontend/.env.local.example frontend/.env.local
```

Заполни реальный `DATABASE_URL` в `backend/.env`, затем:

```bash
docker compose build
docker compose up
```

Backend будет доступен на `http://localhost:8000`, frontend — на `http://localhost:3000`.

## Управление Каталогом

Каталог товаров управляется через операторский UI, а не через правку frontend-кода. Админка доступна только аккаунтам с `is_admin=true`.

Для локального dev первый админ создаётся регистрацией email из `ADMIN_EMAILS`. По умолчанию это:

```env
ADMIN_EMAILS=admin@prokatilo.local
```

Открой приложение, выбери регистрацию, создай аккаунт `admin@prokatilo.local` с выбранным паролем. После входа нижняя навигация покажет пункт `Оператор`.

`ADMIN_API_KEY` и `X-Admin-Token` оставлены только как совместимый fallback для внутренних запросов. Новый frontend использует `Authorization: Bearer <token>` от email/password входа.

Основные действия оператора:

```text
Добавить товар -> заполнить форму -> Создать товар
Редактировать -> изменить поля -> Сохранить изменения
Скрыть -> товар получает is_active=false и исчезает из публичного каталога
Доступен/Недоступен -> меняет текущую доступность аренды
```

Public endpoints:

```text
GET /items/
GET /items/available/
GET /items/search/?q=
GET /items/{item_id}
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

## Бронирования И Заявки

Бронь считается созданной только после успешного `POST /orders/`. Frontend больше не создаёт фиктивные локальные брони, если backend недоступен.

Цена заказа рассчитывается на backend из сохранённых цен товара по выбранному тарифу. Поле `total_price` в клиентском payload остаётся совместимым с текущим API, но не является источником истины.

Клиентский flow:

```bash
curl -X POST http://localhost:8000/orders/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "item_id": 1,
    "customer_name": "Александр",
    "customer_phone": "+79990000000",
    "delivery_address": "ул. Ленина, 10",
    "payment_method": "cash",
    "tariff_type": "3h",
    "total_price": 990,
    "rental_date": "2026-05-27",
    "rental_time": "12:00"
  }'
```

Посмотреть брони клиента:

```bash
curl http://localhost:8000/me/orders \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Операторский flow:

```bash
curl http://localhost:8000/admin/orders/ \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```

```bash
curl -X PATCH "http://localhost:8000/admin/orders/1/status?new_status=confirmed" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```

Public order endpoints:

```text
POST /orders/
GET /me/orders
```

Admin order endpoints:

```text
GET /admin/orders/
GET /admin/orders/{order_id}
PATCH /admin/orders/{order_id}
PATCH /admin/orders/{order_id}/status?new_status=
```

## Миграции

Применить миграции:

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

Создать новую миграцию после изменения моделей:

```bash
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "describe schema change"
```

Откатить одну миграцию:

```bash
cd backend
source .venv/bin/activate
alembic downgrade -1
```

## Healthcheck

```bash
curl http://localhost:8000/health
```

Ожидаемый ответ:

```json
{"status":"ok","service":"prokatilo-api"}
```

## Production Notes

- Секреты не коммитятся; реальные значения держим в env на сервере.
- На VPS нужен reverse proxy и HTTPS.
- `Base.metadata.create_all` выключен по умолчанию.
- Схема production базы меняется через Alembic migrations.
- Перед запуском новой версии применяй `alembic upgrade head`.

## Roadmap До Production MVP

Sprint 2 — email-авторизация и личный кабинет:

```text
User model
email/password регистрация и вход
password hashing
/auth/me
/me/orders
is_admin или простая role-модель
заказы клиента без доступа по customer_phone query
```

Sprint 3 — YooKassa и VPS release candidate:

```text
создание платежа на backend
YooKassa payment id и payment_status
redirect/confirmation flow
webhook succeeded/canceled
статус оплаты в админке и личном кабинете
reverse proxy, HTTPS, production env checklist
```
