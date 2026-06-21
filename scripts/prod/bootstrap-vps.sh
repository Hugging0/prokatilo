#!/usr/bin/env bash
set -Eeuo pipefail

REPO_URL_DEFAULT="https://github.com/Hugging0/prokatilo.git"
PROJECT_DIR_DEFAULT="/opt/prokatilo"
BRANCH_DEFAULT="main"
DOMAIN_DEFAULT="myprokatilo.ru"
ADMIN_EMAIL_DEFAULT="admin@myprokatilo.ru"

log() {
  printf '\n\033[1;36m==> %s\033[0m\n' "$1"
}

die() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

prompt() {
  local label="$1"
  local default_value="$2"
  local value

  read -r -p "$label [$default_value]: " value
  printf '%s' "${value:-$default_value}"
}

prompt_secret() {
  local label="$1"
  local default_value="$2"
  local value

  read -r -s -p "$label [generated if empty]: " value
  printf '\n' >&2
  printf '%s' "${value:-$default_value}"
}

random_secret() {
  openssl rand -base64 48 | tr -d '\n'
}

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    die "Run this script as root on the new VPS."
  fi
}

load_os() {
  # shellcheck disable=SC1091
  source /etc/os-release

  if [[ "${ID}" != "ubuntu" && "${ID}" != "debian" ]]; then
    die "Only Ubuntu/Debian VPS images are supported by this bootstrap script."
  fi

  if [[ -z "${VERSION_CODENAME:-}" ]]; then
    die "VERSION_CODENAME is missing in /etc/os-release."
  fi
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    log "Docker and Compose plugin are already installed"
    return
  fi

  log "Installing Docker Engine and Compose plugin"
  apt-get update
  apt-get install -y ca-certificates curl gnupg git openssl
  install -m 0755 -d /etc/apt/keyrings

  if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
    curl -fsSL "https://download.docker.com/linux/${ID}/gpg" \
      | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  fi

  chmod a+r /etc/apt/keyrings/docker.gpg
  printf \
    'deb [arch=%s signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/%s %s stable\n' \
    "$(dpkg --print-architecture)" \
    "${ID}" \
    "${VERSION_CODENAME}" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update
  apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin
}

clone_or_update_repo() {
  log "Preparing project directory"
  mkdir -p "$(dirname "${PROJECT_DIR}")"

  if [[ -d "${PROJECT_DIR}/.git" ]]; then
    git -C "${PROJECT_DIR}" fetch origin "${BRANCH}"
    git -C "${PROJECT_DIR}" checkout -B "${BRANCH}" "origin/${BRANCH}"
  elif [[ -e "${PROJECT_DIR}" && -n "$(find "${PROJECT_DIR}" -mindepth 1 -maxdepth 1 2>/dev/null)" ]]; then
    die "${PROJECT_DIR} exists and is not an empty git checkout."
  else
    git clone --branch "${BRANCH}" "${REPO_URL}" "${PROJECT_DIR}"
  fi
}

write_file_safely() {
  local path="$1"
  local content="$2"

  if [[ -f "${path}" ]]; then
    local answer
    read -r -p "${path} already exists. Replace it? [y/N]: " answer

    if [[ ! "${answer}" =~ ^[Yy]$ ]]; then
      log "Keeping existing ${path}"
      return
    fi
  fi

  umask 077
  printf '%s\n' "${content}" > "${path}"
}

write_env_files() {
  log "Writing runtime env files"
  local cors_origins="https://${APP_DOMAIN},https://www.${APP_DOMAIN},http://${APP_DOMAIN},http://www.${APP_DOMAIN}"
  local return_url="https://${APP_DOMAIN}"

  write_file_safely "${PROJECT_DIR}/.env" \
"APP_DOMAIN=${APP_DOMAIN}
ACME_EMAIL=${ACME_EMAIL}

POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

NEXT_PUBLIC_API_URL=/api
CORS_ORIGINS=${cors_origins}
YOOKASSA_RETURN_URL=${return_url}"

  mkdir -p "${PROJECT_DIR}/backend"
  write_file_safely "${PROJECT_DIR}/backend/.env" \
"ADMIN_EMAILS=${ADMIN_EMAIL}
AUTH_SECRET=${AUTH_SECRET}

YOOKASSA_SHOP_ID=${YOOKASSA_SHOP_ID}
YOOKASSA_SECRET_KEY=${YOOKASSA_SECRET_KEY}
YOOKASSA_RETURN_URL=${return_url}

CORS_ORIGINS=${cors_origins}
ENVIRONMENT=production
API_ROOT_PATH=/api
CREATE_TABLES_ON_STARTUP=false"
}

deploy_stack() {
  log "Building images"
  cd "${PROJECT_DIR}"
  docker compose build

  log "Running database migrations"
  docker compose run --rm backend alembic upgrade head

  log "Starting services"
  docker compose up -d
}

print_next_steps() {
  cat <<EOF

Bootstrap finished.

Check DNS before opening the site:
  ${APP_DOMAIN} and www.${APP_DOMAIN} must point to this VPS public IP.

Useful commands:
  cd ${PROJECT_DIR}
  ./scripts/prod/smoke-test.sh
  ./scripts/prod/deploy.sh

EOF
}

require_root
load_os

log "Collecting deployment settings"
REPO_URL="$(prompt "Git repository" "${REPO_URL_DEFAULT}")"
PROJECT_DIR="$(prompt "Project directory" "${PROJECT_DIR_DEFAULT}")"
BRANCH="$(prompt "Git branch" "${BRANCH_DEFAULT}")"
APP_DOMAIN="$(prompt "Primary domain" "${DOMAIN_DEFAULT}")"
ACME_EMAIL="$(prompt "ACME email for HTTPS certificates" "${ADMIN_EMAIL_DEFAULT}")"
ADMIN_EMAIL="$(prompt "Admin email" "${ADMIN_EMAIL_DEFAULT}")"
POSTGRES_DB="$(prompt "Postgres database" "prokatilo")"
POSTGRES_USER="$(prompt "Postgres user" "prokatilo")"
POSTGRES_PASSWORD="$(prompt_secret "Postgres password" "$(random_secret)")"
AUTH_SECRET="$(prompt_secret "Backend auth secret" "$(random_secret)")"
YOOKASSA_SHOP_ID="$(prompt "YooKassa shop id" "")"
YOOKASSA_SECRET_KEY="$(prompt_secret "YooKassa secret key" "")"

install_docker
clone_or_update_repo
write_env_files
deploy_stack
print_next_steps
