# PROKATilo Frontend

Это frontend для проекта ПРОКАТило. Он работает на Next.js App Router и ходит в backend через `NEXT_PUBLIC_API_URL`.

## Стек

- Next.js 16.2.4
- React 19.2.4
- TypeScript
- Tailwind CSS 4

## Запуск

```bash
npm install
npm run dev
```

По умолчанию frontend ожидает backend на `/api`. В production этот путь проксируется Caddy в backend.

## Локальная настройка

Создай `frontend/.env.local` по шаблону:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Для VPS production:

```bash
NEXT_PUBLIC_API_URL=/api
```

## Что важно знать

- Фронтенд не создает товары напрямую, для этого используется админский API `POST /admin/items/`
- Основные пользовательские потоки идут через `/auth/*`, `/items/*`, `/orders/*`, `/payments/*`
- При работе через домен frontend вызывает backend через `/api/*`, чтобы не открывать отдельный публичный backend URL
- Если backend пустой, сначала создай хотя бы один товар через админку или admin API

## Полезные endpoint'ы backend

```text
GET /health
POST /auth/register
POST /auth/login
GET /auth/me
GET /items/
GET /items/available/
GET /items/search/?q=
GET /items/{item_id}/bookings?rental_date=YYYY-MM-DD
POST /orders/
POST /orders/{order_id}/payment
GET /me/orders
```
