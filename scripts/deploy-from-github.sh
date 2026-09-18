#!/usr/bin/env bash
# Flash Point Network — deploy from GitHub (pull → build → PM2)
#
# Does NOT run Supabase migrations. Apply SQL from your local machine:
#   npm run db:apply
#
# Typical paths:
#   CyberPanel (current):  /home/fptn.com/app/flashpoint-network
#   Hestia-style (future): /home/admin/web/app.fptn.com/public_html
#
# Usage (from app root, or via absolute path to this script):
#   bash scripts/deploy-from-github.sh
#
# Overrides:
#   GIT_BRANCH=main PM2_APP_NAME=fptn APP_PORT=43125
#   DEPLOY_SOFT_PULL=1   # git pull --ff-only instead of hard reset
#   SKIP_PM2=1           # pull + build only
#
# Dev host (path contains dev.fptn.com): set GIT_BRANCH / PM2_APP_NAME / APP_PORT
# explicitly, or defaults become: branch=dev, pm2=fptn-dev, port=43126.
set -euo pipefail

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ensure_git_safe_directory() {
  local dir="$1"
  if ! git config --global --get-all safe.directory 2>/dev/null | grep -Fxq "$dir"; then
    log "git safe.directory += $dir"
    git config --global --add safe.directory "$dir"
  fi
}

resolve_defaults() {
  # Path-based light defaults: prod vs future dev.fptn.com
  if [[ "$ROOT" == *dev.fptn.com* ]]; then
    DEFAULT_BRANCH="dev"
    DEFAULT_PM2="fptn-dev"
    DEFAULT_PORT="43126"
    if [[ -z "${GIT_BRANCH:-}" || -z "${PM2_APP_NAME:-}" || -z "${APP_PORT:-}" ]]; then
      log "dev.fptn.com path detected — using defaults branch=$DEFAULT_BRANCH pm2=$DEFAULT_PM2 port=$DEFAULT_PORT"
      log "set GIT_BRANCH / PM2_APP_NAME / APP_PORT explicitly to override"
    fi
  elif [[ "$ROOT" == *fptn.com* ]]; then
    DEFAULT_BRANCH="main"
    DEFAULT_PM2="fptn"
    DEFAULT_PORT="43125"
  else
    DEFAULT_BRANCH="main"
    DEFAULT_PM2="fptn"
    DEFAULT_PORT="43125"
  fi
}

resolve_defaults

BRANCH="${GIT_BRANCH:-$DEFAULT_BRANCH}"
PM2_APP_NAME="${PM2_APP_NAME:-$DEFAULT_PM2}"
APP_PORT="${APP_PORT:-$DEFAULT_PORT}"
export PORT="$APP_PORT"

BACKUP_DIR=""
ENV_LOCAL_BACKUP=""
ENV_PROD_BACKUP=""
ENV_RESTORED=0

cleanup_backups() {
  if [[ -n "$BACKUP_DIR" && -d "$BACKUP_DIR" ]]; then
    rm -rf "$BACKUP_DIR"
  fi
}

restore_env_files() {
  if [[ -n "$ENV_LOCAL_BACKUP" && -f "$ENV_LOCAL_BACKUP" ]]; then
    cp -a "$ENV_LOCAL_BACKUP" .env.local
    log "restored .env.local"
  fi
  if [[ -n "$ENV_PROD_BACKUP" && -f "$ENV_PROD_BACKUP" ]]; then
    cp -a "$ENV_PROD_BACKUP" .env.production
    log "restored .env.production"
  fi
}

# Always restore env after git ops, even if a later step fails
on_exit() {
  if [[ "$ENV_RESTORED" != "1" ]]; then
    restore_env_files || true
    ENV_RESTORED=1
  fi
  cleanup_backups
}
trap on_exit EXIT

backup_env_files() {
  BACKUP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/fptn-deploy-env.XXXXXX")"
  if [[ -f .env.local ]]; then
    ENV_LOCAL_BACKUP="$BACKUP_DIR/.env.local"
    cp -a .env.local "$ENV_LOCAL_BACKUP"
    log "backed up .env.local"
  else
    log "WARN: .env.local not found (expected on VPS)"
  fi
  if [[ -f .env.production ]]; then
    ENV_PROD_BACKUP="$BACKUP_DIR/.env.production"
    cp -a .env.production "$ENV_PROD_BACKUP"
    log "backed up .env.production"
  fi
}

warn_if_env_tracked() {
  if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
    log "WARN: .env.local is tracked in git — secrets may leak; untrack it"
  fi
  if git ls-files --error-unmatch .env.production >/dev/null 2>&1; then
    log "WARN: .env.production is tracked in git — secrets may leak; untrack it"
  fi
}

sync_git() {
  ensure_git_safe_directory "$ROOT"
  log "fetch origin"
  git fetch origin

  if [[ "${DEPLOY_SOFT_PULL:-0}" == "1" ]]; then
    log "soft pull origin/$BRANCH (DEPLOY_SOFT_PULL=1)"
    git checkout "$BRANCH" 2>/dev/null || git checkout -B "$BRANCH" "origin/$BRANCH"
    git pull --ff-only origin "$BRANCH"
  else
    log "hard reset to origin/$BRANCH"
    git checkout "$BRANCH" 2>/dev/null || git checkout -B "$BRANCH" "origin/$BRANCH"
    git reset --hard "origin/$BRANCH"
  fi

  # Drop untracked junk but keep env files and runtime media uploads on disk.
  # public/uploads must survive deploys (admin Sharp → local files, not Storage).
  git clean -fd \
    -e .env.local \
    -e .env.production \
    -e '.env.local.*' \
    -e '.env.production.*' \
    -e public/uploads \
    -e 'public/uploads/**'
}

pm2_restart_or_start() {
  if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
    log "pm2 restart $PM2_APP_NAME --update-env"
    pm2 restart "$PM2_APP_NAME" --update-env
  else
    log "pm2 start npm --name $PM2_APP_NAME -- start (port $APP_PORT via package.json)"
    pm2 start npm --name "$PM2_APP_NAME" -- start
  fi
  pm2 save
  pm2 flush
}

# --- main ---
log "ROOT=$ROOT"
log "branch=$BRANCH pm2=$PM2_APP_NAME port=$APP_PORT"

command -v git >/dev/null || die "git not found"
command -v npm >/dev/null || die "npm not found"
if [[ "${SKIP_PM2:-0}" != "1" ]]; then
  command -v pm2 >/dev/null || die "pm2 not found (or set SKIP_PM2=1)"
fi

warn_if_env_tracked
backup_env_files
sync_git
restore_env_files
ENV_RESTORED=1

log "npm ci"
npm ci

log "npm run build"
npm run build

if [[ ! -f .next/BUILD_ID ]]; then
  die "build failed: missing .next/BUILD_ID"
fi
log "BUILD_ID=$(cat .next/BUILD_ID)"

if [[ "${SKIP_PM2:-0}" == "1" ]]; then
  log "SKIP_PM2=1 — skipping pm2 restart"
else
  pm2_restart_or_start
fi

log "OK → $BRANCH @ $(git rev-parse --short HEAD) (pm2=$PM2_APP_NAME port=$APP_PORT)"
