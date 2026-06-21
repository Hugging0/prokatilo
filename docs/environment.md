# Environment variables

Реальные env-файлы не коммитятся. В репозитории хранятся только `.env.example`, `backend/.env.example` и `frontend/.env.local.example`.

## Root `.env`

Root `.env` читает Docker Compose.

Минимальный production пример:

```env
APP_DOMAIN=myprokatilo.ru
ACME_EMAIL=admin@myprokatilo.ru

POSTGRES_DB=prokatilo
POSTGRES_USER=prokatilo
POSTGRES_PASSWORD=change-me-production-postgres-password

NEXT_PUBLIC_API_URL=/api
CORS_ORIGINS=https://myprokatilo.ru,https://www.myprokatilo.ru,http://myprokatilo.ru,http://www.myprokatilo.ru
YOOKASSA_RETURN_URL=https://myprokatilo.ru
```

Что делает root `.env`:

- задает домен для Caddy;
- задает Postgres database/user/password;
- задает public frontend API URL;
- задает CORS и YooKassa return URL.

## `backend/.env`

`backend/.env` хранит runtime-секреты backend.

```env
ADMIN_EMAILS=admin@myprokatilo.ru
AUTH_SECRET=change-me-production-auth-secret

YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
YOOKASSA_RETURN_URL=https://myprokatilo.ru

CORS_ORIGINS=https://myprokatilo.ru,https://www.myprokatilo.ru,http://myprokatilo.ru,http://www.myprokatilo.ru
ENVIRONMENT=production
API_ROOT_PATH=/api
CREATE_TABLES_ON_STARTUP=false
```

В Docker Compose production `DATABASE_URL` собирается в `docker-compose.yml` из root `.env`, поэтому в `backend/.env` его обычно не нужно задавать.

## Frontend env

Локально:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Production через Caddy:

```env
NEXT_PUBLIC_API_URL=/api
```

Frontend env не должен содержать секреты. Все публичные переменные начинаются с `NEXT_PUBLIC_`.

## Что нельзя коммитить

- root `.env`;
- `backend/.env`;
- `frontend/.env.local`;
- любые реальные ключи YooKassa;
- реальные пароли PostgreSQL;
- production `AUTH_SECRET`.

Если секрет случайно попал в git, его нужно считать скомпрометированным и заменить.
