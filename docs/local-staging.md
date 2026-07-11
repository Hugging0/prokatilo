# Local staging

Локальный стенд нужен, чтобы проверять изменения до production deploy.

## Первый запуск

На macOS используется `colima + docker + docker-compose`.

```bash
brew install colima docker docker-compose
colima start --cpu 2 --memory 4 --disk 30
```

Затем из корня проекта:

```bash
./scripts/local/up.sh
```

Стенд откроется здесь:

```text
http://localhost:8080/app
```

Локальные тестовые аккаунты:

```text
admin@prokatilo.local / admin123
client@prokatilo.local / client123
```

## Что поднимается

- `postgres` с отдельным Docker volume проекта `prokatilo_local`;
- `backend` с Alembic migrations;
- `frontend` production build;
- `caddy` на `http://localhost:8080`, который проксирует `/api` в backend.

Production `.env` не используется. Скрипт создает локальный `.env.local`, если его нет.

## Остановить

```bash
./scripts/local/down.sh
```

## Полный сброс локальной БД

Удаляет только локальные Docker volumes проекта `prokatilo_local`.

```bash
./scripts/local/reset-db.sh --yes
```

## Вернуть локальный код к production-состоянию

Если на тестовом стенде нужно снова получить код, который сейчас реально стоит на production:

```bash
./scripts/local/sync-code-from-prod.sh
./scripts/local/reset-db.sh --yes
```

Скрипт читает commit на VPS через SSH и переключает локальный checkout на ветку
`local-prod-sync` с этим commit.

Production-данные автоматически не копируются в локальную БД. Это сознательно:
в production могут быть пользовательские телефоны, адреса и заказы.

## Production deploy после проверки

Когда локально все проверено:

```bash
./scripts/prod/deploy-remote.sh
```

Скрипт пушит текущую ветку в GitHub, затем на VPS запускает `scripts/prod/deploy.sh`
и `scripts/prod/smoke-test.sh`.
