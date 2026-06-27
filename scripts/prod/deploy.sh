#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"
BRANCH="${BRANCH:-main}"
ENV_BACKUP=""

log() {
  printf '\n\033[1;36m==> %s\033[0m\n' "$1"
}

die() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

cleanup() {
  if [[ -n "${ENV_BACKUP}" && -f "${ENV_BACKUP}" ]]; then
    rm -f "${ENV_BACKUP}"
  fi
}
trap cleanup EXIT

cd "${PROJECT_DIR}"

if [[ ! -d .git ]]; then
  die "${PROJECT_DIR} is not a git checkout."
fi

if [[ ! -f backend/.env ]]; then
  die "backend/.env is missing. Run scripts/prod/bootstrap-vps.sh or create it from backend/.env.example."
fi

dirty_other="$(
  git status --porcelain \
    | grep -vE '^[ MADRCU?!]{2}backend/\.env$|^[ MADRCU?!]{2} backend/\.env$' \
    || true
)"

if [[ -n "${dirty_other}" ]]; then
  printf '%s\n' "${dirty_other}" >&2
  die "Working tree has changes outside backend/.env. Commit or clean them before deploy."
fi

ENV_BACKUP="$(mktemp)"
cp backend/.env "${ENV_BACKUP}"

if git ls-files --error-unmatch backend/.env >/dev/null 2>&1; then
  git checkout -- backend/.env
fi

log "Fetching ${BRANCH}"
git fetch origin "${BRANCH}"
git checkout -B "${BRANCH}" "origin/${BRANCH}"

mkdir -p backend
cp "${ENV_BACKUP}" backend/.env
chmod 600 backend/.env

log "Building backend and frontend"
docker compose build backend frontend

log "Running migrations"
docker compose run --rm backend alembic upgrade head

log "Starting services"
docker compose up -d postgres backend frontend caddy

log "Reloading Caddy configuration"
docker compose exec -T caddy \
  caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

log "Deployment finished"
docker compose ps
