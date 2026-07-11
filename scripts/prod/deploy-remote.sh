#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROD_HOST="${PROD_HOST:-root@109.69.16.142}"
PROD_PROJECT_DIR="${PROD_PROJECT_DIR:-/opt/prokatilo}"
BRANCH="${BRANCH:-$(git -C "${ROOT_DIR}" rev-parse --abbrev-ref HEAD)}"

cd "${ROOT_DIR}"

if [[ -n "$(git status --porcelain)" ]]; then
  printf 'Working tree has uncommitted changes. Commit before production deploy.\n' >&2
  exit 1
fi

git push origin "${BRANCH}"

ssh -o BatchMode=yes "${PROD_HOST}" \
  "cd '${PROD_PROJECT_DIR}' && BRANCH='${BRANCH}' ./scripts/prod/deploy.sh && ./scripts/prod/smoke-test.sh"
