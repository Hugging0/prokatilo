# LLM agent handbook

Дата актуализации: 2026-07-08.

Этот файл — быстрый вход в ПРОКАТило для нового LLM-агента. Он не заменяет код, но задает порядок чтения и главные ограничения проекта.

## Сначала прочитать

1. `README.md` — короткий вход, стек и команды.
2. `PRODUCT.md` — продуктовая модель, аудитория и анти-референсы.
3. `DESIGN.md` — единый визуальный язык PWA и SEO-сайта.
4. `docs/project-context.md` — актуальная архитектура, сервисы и доменные правила.
5. `docs/environment.md` — env-файлы и секреты.
6. `docs/deployment.md` — VPS deploy, Caddy, Docker Compose, smoke-test.
7. `docs/context-ignore.md` — что не нужно грузить в LLM-контекст.

## Frontend context

Frontend живет в `frontend/`.

Обязательные правила перед UI/UX-правками:

- `frontend/docs/frontend-map.md`
- `frontend/docs/ui-style-guide.md`
- `frontend/docs/code-style.md`
- `frontend/docs/refactoring-rules.md`
- `frontend/docs/catalog-images.md`, если задача касается фото товаров

Главные зоны кода:

- `frontend/src/app/page.tsx` — server-rendered SEO-главная.
- `frontend/src/app/app/page.tsx` — клиентское PWA-приложение.
- `frontend/src/components/seo/*` — SEO-страницы и интерактивный публичный каталог.
- `frontend/src/components/features/*` — пользовательские и операторские сценарии PWA.
- `frontend/src/components/ui/*` — локальные UI primitives.
- `frontend/src/lib/api/*` — frontend API clients.
- `frontend/src/lib/mappers/*` — преобразование backend DTO в UI-модели.
- `frontend/src/lib/seo/*` — SEO route/content/metadata/json-ld конфигурация.

## Backend context

Backend живет в `backend/`.

Ключевые файлы:

- `backend/app/main.py` — FastAPI app и routes.
- `backend/app/models.py` — SQLAlchemy models.
- `backend/app/schemas.py` — Pydantic schemas.
- `backend/app/crud.py` — основная бизнес-логика данных.
- `backend/app/auth.py` — email/password auth и admin user logic.
- `backend/app/settings.py` — runtime config.
- `backend/alembic/versions/*` — история схемы БД.
- `backend/scripts/import_delivery_addresses.py` — импорт локальных адресов доставки.

Production schema changes делать только через Alembic migrations.

## Current production

- Production VPS: `/opt/prokatilo`.
- Production domain: `myprokatilo.ru`.
- Public site: `/`.
- PWA app: `/app`.
- Backend API: `/api`.
- Reverse proxy: Caddy.
- Database: PostgreSQL в Docker Compose volume `postgres_data`.
- Deploy: `scripts/prod/deploy.sh`.
- Smoke-test: `scripts/prod/smoke-test.sh`.

Перед изменениями, которые должны попасть на сервер, сверить:

```bash
git status --short
git rev-parse HEAD
git ls-remote origin refs/heads/main
ssh root@109.69.16.142 'cd /opt/prokatilo && git rev-parse HEAD && git status --short'
```

Если на VPS есть незакоммиченные production-правки, сначала понять их смысл и перенести в git, а не затирать.

## Product rules

- ПРОКАТило — B2C-сервис, не peer-to-peer.
- В текстах использовать: сервис, оператор, курьер, поддержка, зона обслуживания.
- Не использовать для клиентского сценария: сосед, владелец, арендодатель, чужая вещь.
- Тарифы каталога: 3 часа, день, неделя.
- `price_per_6h` больше не является актуальной продуктовой сущностью.
- Бронь создается только после авторизации и успешного ответа backend.
- Backend — источник истины для каталога, заказов, цен, бонусов и доступности.
- Оплата в текущем MVP остается курьеру, без пользовательского флоу СБП.

## UI rules

- Сохранять shadcn-like аккуратность: понятная иерархия, спокойные карточки, читаемая Manrope, минимум лишних бейджей.
- Не дублировать один и тот же смысл в соседних блоках.
- Не добавлять мелкий `text-[9px]`/`text-[10px]` для важного текста.
- Важные действия должны быть видны и не перекрываться нижней навигацией.
- SEO-сайт может быть выразительнее PWA, но PWA должно оставаться спокойным рабочим интерфейсом.

## Verification baseline

Обычно достаточно:

```bash
cd frontend && npm run lint && npm run build
python3 -m compileall backend/app
git diff --check
```

Для production:

```bash
cd /opt/prokatilo
./scripts/prod/deploy.sh
./scripts/prod/smoke-test.sh
```

Browser/Lighthouse/Playwright использовать по задаче, особенно после визуальных или PWA-изменений.
