#!/usr/bin/env bash
# Thin wrapper — canonical deploy is scripts/deploy-from-github.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# Optional positional branch → GIT_BRANCH for the canonical script
if [[ $# -ge 1 && -z "${GIT_BRANCH:-}" ]]; then
  export GIT_BRANCH="$1"
  shift
fi
exec bash "$ROOT/scripts/deploy-from-github.sh" "$@"
