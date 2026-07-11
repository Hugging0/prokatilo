#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.local"
COMPOSE=(docker compose --env-file "${ENV_FILE}" -f docker-compose.yml -f docker-compose.local.yml)

cd "${ROOT_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  printf 'Local env file is missing: %s\n' "${ENV_FILE}" >&2
  exit 1
fi

"${COMPOSE[@]}" down --remove-orphans
