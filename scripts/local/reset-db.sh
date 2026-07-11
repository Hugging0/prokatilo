#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.local"
COMPOSE=(docker compose --env-file "${ENV_FILE}" -f docker-compose.yml -f docker-compose.local.yml)

cd "${ROOT_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  ./scripts/local/up.sh
  exit 0
fi

if [[ "${1:-}" != "--yes" ]]; then
  read -r -p "This will delete only local Docker volumes for prokatilo_local. Continue? [y/N]: " answer
  if [[ ! "${answer}" =~ ^[Yy]$ ]]; then
    exit 0
  fi
fi

"${COMPOSE[@]}" down -v --remove-orphans
./scripts/local/up.sh
