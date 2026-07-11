#!/usr/bin/env bash
set -Eeuo pipefail

PROD_HOST="${PROD_HOST:-root@109.69.16.142}"
PROD_PROJECT_DIR="${PROD_PROJECT_DIR:-/opt/prokatilo}"
LOCAL_SYNC_BRANCH="${LOCAL_SYNC_BRANCH:-local-prod-sync}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

die() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

cd "${ROOT_DIR}"

if [[ -n "$(git status --porcelain)" && "${ALLOW_DIRTY:-0}" != "1" ]]; then
  die "Working tree is dirty. Commit/stash changes or run with ALLOW_DIRTY=1."
fi

prod_commit="$(
  ssh -o BatchMode=yes "${PROD_HOST}" \
    "cd '${PROD_PROJECT_DIR}' && git rev-parse HEAD"
)"

printf 'Production commit: %s\n' "${prod_commit}"

git fetch origin --prune

if ! git cat-file -e "${prod_commit}^{commit}" >/dev/null 2>&1; then
  die "Production commit is not available locally. Push/fetch the branch that contains it first."
fi

git switch -C "${LOCAL_SYNC_BRANCH}" "${prod_commit}"

cat <<EOF

Local code now matches production on branch ${LOCAL_SYNC_BRANCH}.
To recreate local DB and containers:
  ./scripts/local/reset-db.sh --yes
EOF
