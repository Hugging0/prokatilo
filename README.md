# ПРОКАТило

ПРОКАТило — mobile-first B2C PWA для аренды вещей и техники с доставкой.

## Стек

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: FastAPI, async SQLAlchemy, Pydantic
- Database: локальный PostgreSQL в Docker Compose
- Migrations: Alembic
- Reverse proxy: Caddy с automatic HTTPS
- Deploy: Docker Compose + production scripts

## Быстрый старт локально

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

## Production на VPS

Новый чистый VPS разворачивается интерактивным bootstrap-скриптом:

```bash
bash scripts/prod/bootstrap-vps.sh
```

Повторный deploy на уже настроенном сервере:

```bash
cd /opt/prokatilo
./scripts/prod/deploy.sh
```

Smoke-test production окружения:

```bash
cd /opt/prokatilo
./scripts/prod/smoke-test.sh
```

## Документация

- [LLM agent handbook](docs/agent-handbook.md)
- [Deployment runbook](docs/deployment.md)
- [Environment variables](docs/environment.md)
- [Project context](docs/project-context.md)
- [Context ignore guide](docs/context-ignore.md)
- [Frontend map](frontend/docs/frontend-map.md)
- [UI style guide](frontend/docs/ui-style-guide.md)
- [Frontend refactoring rules](frontend/docs/refactoring-rules.md)
- [Frontend code style](frontend/docs/code-style.md)
- [Catalog images](frontend/docs/catalog-images.md)

## Важное

- Реальные `.env` и `backend/.env` не коммитятся.
- Production schema changes выполняются только через Alembic migrations.
- Production backend работает за Caddy на `/api`.
- Frontend production build использует `NEXT_PUBLIC_API_URL=/api`.
- Публичный SEO-сайт живет на `/`, PWA-приложение — на `/app`.
