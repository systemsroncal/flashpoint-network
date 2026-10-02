#!/usr/bin/env bash
# Install branded static error HTML for OpenLiteSpeed (CyberPanel).
# Run on the VPS as root (or with sudo) after git pull.
#
#   sudo bash scripts/install-cyberpanel-error-pages.sh
#
# Then paste deploy/openlitespeed/vhost-errorpages.snippet into the site's vHost Conf
# and graceful-restart OpenLiteSpeed (see snippet comments).
set -euo pipefail

log() { printf '[fptn-ols-errors] %s\n' "$*"; }
die() { printf '[fptn-ols-errors] ERROR: %s\n' "$*" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/deploy/openlitespeed/fptn-error.html"
[[ -f "$SRC" ]] || die "missing $SRC — run from flashpoint-network repo"

# CyberPanel site home (override if your docroot differs)
FPTN_HOME="${FPTN_HOME:-/home/fptn.com}"
DEST_DIR="$FPTN_HOME/deploy-pages"
DEST_FILE="$DEST_DIR/fptn-error.html"

mkdir -p "$DEST_DIR"
cp -a "$SRC" "$DEST_FILE"
chmod 644 "$DEST_FILE"

# Optional: same file under public_html for direct URL tests
PUBLIC_HTML="${FPTN_PUBLIC_HTML:-$FPTN_HOME/public_html}"
if [[ -d "$PUBLIC_HTML" ]]; then
  cp -a "$SRC" "$PUBLIC_HTML/fptn-error.html"
  chmod 644 "$PUBLIC_HTML/fptn-error.html"
  log "also copied → $PUBLIC_HTML/fptn-error.html (optional test URL)"
fi

log "installed → $DEST_FILE"
log ""
log "Next steps:"
log "  1. CyberPanel → Websites → fptn.com → vHost Conf"
log "  2. Append contents of: $ROOT/deploy/openlitespeed/vhost-errorpages.snippet"
log "  3. Graceful Restart OpenLiteSpeed"
log ""
log "Test file exists: ls -la $DEST_FILE"
