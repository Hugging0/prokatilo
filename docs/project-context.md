# ПРОКАТило: контекст проекта и аудит документации

- Дата проверки: 2026-05-31
- Сервер: Ubuntu 24.04.1 LTS
- Хостнейм на VPS: `prokatilo-new`
- Публичный IP: `193.233.246.61`
- Репозиторий на VPS: `/opt/prokatilo`
- Текущая ветка: `sprint-3-payments-vps`
- Актуальный HEAD на сервере: `338f49a feat: add yookassa payment flow`

## Что сейчас запущено

- `prokatilo-frontend-1` на `0.0.0.0:3000`
- `prokatilo-backend-1` на `0.0.0.0:8000`
- Backend health-check отвечает `{"status":"ok","service":"prokatilo-api"}`
- Запуск идёт через Docker Compose
- В Спринте 1 добавлен локальный PostgreSQL compose-сервис `postgres`
- В Спринте 1 добавлен Caddy reverse proxy для `prokatilo.com`, `www.prokatilo.com` и `http://193.233.246.61`
- DNS `prokatilo.com` должен указывать A-записью на `193.233.246.61`; до смены DNS домен всё ещё ведёт на старый IP

## Архитектура

- Frontend: Next.js 16.2.4, React 19.2.4, TypeScript
- Backend: FastAPI + async SQLAlchemy + Pydantic
- Миграции: Alembic
- Платежи: YooKassa
- Аутентификация: email/password с HMAC-подписью токена
- База данных: локальный PostgreSQL в Docker Compose; приложение получает `DATABASE_URL` из compose environment

## Реальные переменные окружения на VPS

- `NEXT_PUBLIC_API_URL=/api`
- `YOOKASSA_RETURN_URL=https://prokatilo.com`
- `CORS_ORIGINS` включает IP, `prokatilo.com` и `www.prokatilo.com`
- `ENVIRONMENT=production`
- `CREATE_TABLES_ON_STARTUP=false`
- `ADMIN_EMAILS=admin@prokatilo.local`
- `ADMIN_API_KEY=` пустой, fallback сейчас не используется
- `AUTH_SECRET` задан в `backend/.env`
- `DATABASE_URL` переопределяется в `docker-compose.yml` и указывает на compose-сервис `postgres`
- `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY` заданы в `backend/.env`

## API, который реально экспортирует backend

- Auth: `/auth/register`, `/auth/login`, `/auth/me`
- Public items: `/items/`, `/items/available/`, `/items/search/`, `/items/{item_id}`
- Admin items: `/admin/items/`, `/admin/items/{item_id}`, `/admin/items/{item_id}/availability`, `/admin/items/{item_id}/archive`, `DELETE /admin/items/{item_id}`
- Orders: `/orders/`, `/orders/{order_id}`, `/orders/my`, `/me/orders`
- Admin orders: `/admin/orders/`, `/admin/orders/{order_id}`, `/admin/orders/{order_id}/status`
- Payments: `/orders/{order_id}/payment`, `/payments/yookassa/webhook`
- Booking calendar: `/items/{item_id}/bookings?rental_date=YYYY-MM-DD`

## Спринт 2: логика бронирования

- Заказы получили реальные интервалы `rental_start_at` и `rental_end_at`.
- Backend проверяет пересечения по одному товару для активных статусов: `pending`, `confirmed`, `delivery`, `active`.
- `returned` и `cancelled` больше не блокируют слот.
- Создание заказа больше не переключает `item.is_available=false`.
- `is_available` остаётся ручным операторским флагом технической доступности.
- Публичный каталог должен загружать активные товары через `/items/`, а не только `/items/available/`.

## Что в документации уже не совпадает с кодом

- Корневой `README.md` в целом отражает стек и основной запуск, но ему не хватает более точного описания текущего VPS-окружения и актуальных маршрутов вроде `/auth/me` и `/orders/my`
- `frontend/README.md` сейчас представляет собой шаблон `create-next-app` и не описывает реальный проект
- В `frontend/README.md` есть устаревший пример `POST /items/`, но фактический endpoint для создания товара в коде — `POST /admin/items/`
- Документации не хватает явного пояснения, что в production админ-доступ сейчас идёт через аккаунт из `ADMIN_EMAILS`, потому что `ADMIN_API_KEY` пустой
- Документации не хватает runbook для backup/restore локальной PostgreSQL

## Что стоит обновить

- `README.md` в корне репозитория
- `frontend/README.md`
- Опционально добавить центральный `docs/project-context.md`, чтобы было одно место с актуальным состоянием проекта

## Короткий вывод

- Проект живой и уже развернут на VPS
- Базовый стек из README верный
- Frontend README устарел сильнее всего и требует полной замены
- Главная практическая ошибка в документации сейчас — неверный пример создания товара и отсутствие описания реального production-окружения
