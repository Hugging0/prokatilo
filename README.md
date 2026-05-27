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

Каталог товаров управляется через операторский UI, а не через правку frontend-кода. Для доступа к управлению задай `ADMIN_API_KEY` в `backend/.env`:

```env
ADMIN_API_KEY=long-random-admin-token
```

В интерфейсе открой профиль, включи режим оператора, перейди в `Каталог` и введи этот ключ в форму `Доступ оператора`. Ключ хранится только в текущем браузере и отправляется в backend как header `X-Admin-Token`.

Текущий `X-Admin-Token` — internal admin guard до полноценной авторизации. Не добавляй его в `NEXT_PUBLIC_*` переменные и не вшивай в frontend bundle.

Основные действия оператора:

```text
Добавить товар -> заполнить форму -> Создать товар
Редактировать -> изменить поля -> Сохранить товар
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
