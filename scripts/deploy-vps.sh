#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="${1:-cursor/admin-brand-orange-987f}"
cd "$ROOT"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
npm run build
pm2 restart fptn --update-env
pm2 flush
echo "Deploy OK → $BRANCH"
