#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"

log() {
  printf '\n\033[1;36m==> %s\033[0m\n' "$1"
}

die() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

load_root_env() {
  if [[ ! -f .env ]]; then
    return
  fi

  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
}

cd "${PROJECT_DIR}"

if [[ ! -f docker-compose.yml ]]; then
  die "docker-compose.yml is missing. Run this script from the project root."
fi

load_root_env

log "Compose services"
docker compose ps

log "Backend container health"
docker compose exec -T backend python - <<'PY'
import urllib.request

response = urllib.request.urlopen("http://localhost:8000/health", timeout=5)
print(response.read().decode("utf-8"))
PY

log "Alembic current revision"
docker compose run --rm backend alembic current

if [[ -n "${APP_DOMAIN:-}" ]]; then
  log "Public API health"
  curl -fsS "https://${APP_DOMAIN}/api/health"
  printf '\n'
fi

log "Smoke test finished"
