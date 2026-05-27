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
