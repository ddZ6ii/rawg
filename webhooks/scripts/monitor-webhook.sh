#!/bin/bash

# ⚠️ This script is intended to be run on your local machine to check the health of the webhook endpoint. It is not meant to be run on the server!

SECRET="${WEBHOOK_DEBUG_SECRET:?WEBHOOK_DEBUG_SECRET env var not set}"
# An empty JSON object is used as payload — HMAC must sign something,
# and {} is explicit about the intent (no payload needed for a health check)
PAYLOAD='{}'
SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print "sha256="$2}')

echo "=== Webhook Health Check ==="

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://hooks.yourdomain.com/hooks/health-check \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIG" \
  -d "$PAYLOAD")

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "[$(date)] Webhook healthy (HTTP $HTTP_CODE)"
else
  echo "[$(date)] WARNING: Webhook returned HTTP $HTTP_CODE"
fi
echo "---"