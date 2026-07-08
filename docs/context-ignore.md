# Context ignore guide

Дата актуализации: 2026-07-08.

Этот список нужен для LLM-агентов: какие файлы обычно не стоит добавлять в контекст, если задача не касается их напрямую.

## Всегда пропускать

- `frontend/node_modules/`
- `frontend/.next/`
- `frontend/out/`
- `frontend/dist/`
- `backend/__pycache__/`
- `**/__pycache__/`
- `*.pyc`
- `.pytest_cache/`
- `.mypy_cache/`
- `.DS_Store`
- `context-export/`
- `*.bak.codex_*`
- `.serena/`
- `.impeccable/live/`
- реальные `.env` файлы: `.env`, `backend/.env`, `frontend/.env.local`

## Обычно не нужны для продуктового/кодового анализа

- `frontend/package-lock.json`, если задача не про зависимости.
- `frontend/public/uploads/catalog/source/` — исходники фото; в git там только `.gitignore`.

## Читать только при профильной задаче

- `backend/alembic/versions/*` — если задача касается схемы БД, миграций или истории полей.
- `frontend/public/uploads/catalog/items/*` — если задача касается ассетов каталога.
- `frontend/public/icons/*` и `frontend/src/app/icon.png`/`apple-icon.png` — если задача касается favicon/PWA/иконок.
- `frontend/public/legal/*` — если задача касается юридических текстов.
- `frontend/src/lib/seo/*` и `frontend/src/app/(seo routes)` — если задача касается SEO, индексации, sitemap, robots или публичного сайта.

## Минимальный полезный контекст по типам задач

Frontend UI/PWA:

- `docs/agent-handbook.md`
- `PRODUCT.md`
- `DESIGN.md`
- `frontend/docs/*`
- релевантная feature-папка в `frontend/src/components/features/*`
- соответствующие hooks/API/mappers из `frontend/src/hooks`, `frontend/src/lib/api`, `frontend/src/lib/mappers`

Backend/API:

- `docs/agent-handbook.md`
- `docs/project-context.md`
- `backend/app/main.py`
- `backend/app/models.py`
- `backend/app/schemas.py`
- `backend/app/crud.py`
- `backend/app/settings.py`
- релевантные Alembic migrations

Deploy/VPS:

- `docs/deployment.md`
- `docs/environment.md`
- `docker-compose.yml`
- `deploy/Caddyfile`
- `scripts/prod/*`

SEO/public site:

- `docs/agent-handbook.md`
- `PRODUCT.md`
- `DESIGN.md`
- `frontend/src/lib/seo/*`
- `frontend/src/components/seo/*`
- `frontend/src/app/page.tsx`
- `frontend/src/app/sitemap.ts`
- `frontend/src/app/robots.ts`
