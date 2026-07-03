#!/usr/bin/env bash
# Deploy barbershop on the Hetzner host (Next.js build + PM2 reload).
# Run manually on the server or via GitHub Actions SSH.
set -euo pipefail

BARBERSHOP_ROOT="${BARBERSHOP_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
HTTP_PORT="${HTTP_PORT:-3000}"
PM2_APP="${PM2_APP:-barbershop}"
SKIP_GIT="${SKIP_GIT:-0}"

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

needs_npm_ci() {
  local dir="$1"
  [ ! -d "$dir/node_modules" ] && return 0
  [ ! -f "$dir/package-lock.json" ] && return 0
  [ "$dir/package-lock.json" -nt "$dir/node_modules" ] && return 0
  return 1
}

backup_data() {
  local data_dir="$BARBERSHOP_ROOT/data"
  local backup_dir="$BARBERSHOP_ROOT/data/backups"
  [ -d "$data_dir" ] || return 0
  mkdir -p "$backup_dir"
  local stamp
  stamp="$(date +%Y%m%d-%H%M%S)"
  log "Backing up data/ to data/backups/deploy-$stamp.tar.gz"
  tar -czf "$backup_dir/deploy-$stamp.tar.gz" -C "$BARBERSHOP_ROOT" data \
    --exclude='data/backups' 2>/dev/null || true
}

[ -d "$BARBERSHOP_ROOT" ] || die "Missing $BARBERSHOP_ROOT"

backup_data

if [ "$SKIP_GIT" != "1" ]; then
  log "Updating repo at $BARBERSHOP_ROOT (branch: $DEPLOY_BRANCH)"
  cd "$BARBERSHOP_ROOT"
  git fetch origin "$DEPLOY_BRANCH"
  git checkout "$DEPLOY_BRANCH"
  git reset --hard "origin/$DEPLOY_BRANCH"
  log "Now at $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"
fi

if [ ! -f "$BARBERSHOP_ROOT/.env.local" ]; then
  die "Missing .env.local on server — copy from .env.example and configure before deploy."
fi

log "Installing dependencies"
cd "$BARBERSHOP_ROOT"
if needs_npm_ci "$BARBERSHOP_ROOT"; then
  log "npm ci"
  npm ci
else
  log "Skipping npm ci — lockfile unchanged"
fi

log "Building Next.js app"
rm -rf .next
npm run build

if ! command -v pm2 >/dev/null 2>&1; then
  die "pm2 not found — install with: npm i -g pm2"
fi

log "Starting pm2:$PM2_APP on :$HTTP_PORT"
pm2 delete "$PM2_APP" 2>/dev/null || true
pm2 start ecosystem.config.cjs --update-env
pm2 save

log "Waiting for HTTP :$HTTP_PORT"
ready=0
for _ in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${HTTP_PORT}/" >/dev/null; then
    ready=1
    break
  fi
  sleep 1
done

if [ "$ready" != "1" ]; then
  die "Barbershop HTTP did not respond on :$HTTP_PORT — check: pm2 logs $PM2_APP --lines 40"
fi

log "Deploy OK — barbershop running on http://127.0.0.1:$HTTP_PORT"
log "Tip: hard-refresh the browser (Ctrl+F5) to load the new bundle."
