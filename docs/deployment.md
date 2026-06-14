# Deployment runbook

Этот runbook описывает перенос ПРОКАТило на новый чистый VPS без переноса текущих данных.

## Целевой сервер

Поддерживаемый сценарий:

- Ubuntu 24.04/22.04 или Debian 12;
- root SSH-доступ;
- домен и `www`-поддомен указывают A-записями на новый IP;
- свежая пустая PostgreSQL БД создается внутри Docker Compose.

## One-command bootstrap

На новом VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/Hugging0/prokatilo/main/scripts/prod/bootstrap-vps.sh -o /tmp/prokatilo-bootstrap.sh
bash /tmp/prokatilo-bootstrap.sh
```

Если `curl` еще не установлен:

```bash
apt-get update && apt-get install -y curl
```

Скрипт интерактивно спросит:

- директорию проекта, по умолчанию `/opt/prokatilo`;
- ветку, по умолчанию `main`;
- домен, по умолчанию `ethicalbusiness.ru`;
- email для Caddy/ACME;
- admin email;
- пароль PostgreSQL;
- `AUTH_SECRET`;
- YooKassa keys, если они нужны.

Bootstrap делает:

- устанавливает Docker Engine и Docker Compose plugin официальным apt-методом;
- готовит `.env` и `backend/.env`;
- собирает Docker images;
- запускает Alembic migrations;
- поднимает `postgres`, `backend`, `frontend`, `caddy`.

## DNS и HTTPS

До открытия сайта проверь:

```text
ethicalbusiness.ru      A  <new-vps-ip>
www.ethicalbusiness.ru  A  <new-vps-ip>
```

Caddy читает домен из root `.env`:

```env
APP_DOMAIN=ethicalbusiness.ru
ACME_EMAIL=admin@ethicalbusiness.ru
```

Сертификаты выпускаются и обновляются Caddy автоматически.

## Повторный deploy

На уже настроенном VPS:

```bash
cd /opt/prokatilo
./scripts/prod/deploy.sh
```

Deploy script:

- не коммитит и не удаляет `backend/.env`;
- останавливается, если есть изменения кроме runtime `backend/.env`;
- подтягивает `origin/main`;
- пересобирает backend/frontend;
- запускает Alembic migrations;
- перезапускает compose-сервисы.

Можно выбрать другую ветку:

```bash
BRANCH=sprint-3-payments-vps ./scripts/prod/deploy.sh
```

## Smoke-test

```bash
cd /opt/prokatilo
./scripts/prod/smoke-test.sh
```

Проверяет:

- `docker compose ps`;
- backend health внутри контейнера;
- текущую Alembic revision;
- публичный `https://$APP_DOMAIN/api/health`, если `APP_DOMAIN` задан.

## Новый старт без данных

В этом сценарии текущую PostgreSQL базу не переносим. Новый VPS получает пустой volume `postgres_data`, затем Alembic создает актуальную схему.

Если позже понадобится перенос данных, отдельным спринтом нужно добавить `pg_dump`/`pg_restore` runbook и регулярные backup jobs.
