#!/bin/bash
# Usage: ./deploy-prod.sh <app-name> <semver-tag>
# Example: ./deploy-prod.sh app1 v1.2.3
set -e

# Load secrets from .env file in the same directory as this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
  source "$SCRIPT_DIR/.env"
fi

APP="${1:?Usage: ./deploy-prod.sh <app-name> <semver-tag>}"
TAG="${2:?Usage: ./deploy-prod.sh <app-name> <semver-tag>}"
SECRET="${WEBHOOK_SECRET_RAWG_PROD:?WEBHOOK_SECRET_RAWG_PROD env var not set}"
HOOKS_URL="https://hooks.ddz6ii.io/hooks/deploy-${APP}-prod"

PAYLOAD="{\"tag\":\"${TAG}\"}"
SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print "sha256="$2}')

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deploying ${APP} ${TAG} to production..."
curl -sf -X POST "$HOOKS_URL" \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIG" \
  -d "$PAYLOAD"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done."