#!/bin/bash
# ⚠️ This script is intended to be run on your local machine to verify end-to-end signing without triggering a real deploy. It is not meant to be run on the server!

# Load secrets from .env file in the same directory as this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/.env" ]; then
  source "$SCRIPT_DIR/.env"
fi

SECRET="${WEBHOOK_DEBUG_SECRET:?WEBHOOK_DEBUG_SECRET env var not set}"
PAYLOAD='{"payload":"hello"}'
SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print "sha256="$2}')

curl -X POST https://hooks.ddz6ii.io/hooks/debug-webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIG" \
  -d "$PAYLOAD"