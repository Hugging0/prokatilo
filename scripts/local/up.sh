#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.local"
COMPOSE=(docker compose --env-file "${ENV_FILE}" -f docker-compose.yml -f docker-compose.local.yml)

log() {
  printf '\n\033[1;36m==> %s\033[0m\n' "$1"
}

die() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

ensure_docker() {
  if docker info >/dev/null 2>&1; then
    return
  fi

  if [[ "$(uname -s)" == "Darwin" ]] && command -v colima >/dev/null 2>&1; then
    log "Starting Colima"
    colima start --cpu 2 --memory 4 --disk 30
  fi

  docker info >/dev/null 2>&1 || die "Docker is not running."
}

ensure_env_files() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    log "Creating .env.local"
    umask 077
    cat > "${ENV_FILE}" <<'EOF'
COMPOSE_PROJECT_NAME=prokatilo_local

APP_DOMAIN=localhost
ACME_EMAIL=admin@prokatilo.local

POSTGRES_DB=prokatilo_local
POSTGRES_USER=prokatilo
POSTGRES_PASSWORD=prokatilo-local-password

NEXT_PUBLIC_API_URL=/api
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:3000,http://127.0.0.1:3000
YOOKASSA_RETURN_URL=http://localhost:8080
EOF
  fi

  if [[ ! -f "${ROOT_DIR}/backend/.env" ]]; then
    log "Creating backend/.env for local development"
    umask 077
    cat > "${ROOT_DIR}/backend/.env" <<'EOF'
ADMIN_EMAILS=admin@prokatilo.local
AUTH_SECRET=local-development-auth-secret

YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
YOOKASSA_RETURN_URL=http://localhost:8080

CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://localhost:3000,http://127.0.0.1:3000
ENVIRONMENT=development
API_ROOT_PATH=/api
CREATE_TABLES_ON_STARTUP=false
EOF
  fi
}

cd "${ROOT_DIR}"
ensure_env_files
ensure_docker

log "Building local images"
"${COMPOSE[@]}" build backend frontend

log "Starting local Postgres"
"${COMPOSE[@]}" up -d postgres

log "Running local migrations"
"${COMPOSE[@]}" run --rm backend alembic upgrade head

log "Starting local app stack"
"${COMPOSE[@]}" up -d backend frontend caddy

if [[ "${1:-}" != "--no-seed" ]]; then
  log "Seeding local test data"
  "${COMPOSE[@]}" exec -T backend python scripts/seed_local_data.py
fi

log "Local stack is ready"
"${COMPOSE[@]}" ps
cat <<'EOF'

Open:
  http://localhost:8080/app

Local test accounts:
  admin@prokatilo.local / admin123
  client@prokatilo.local / client123
EOF
