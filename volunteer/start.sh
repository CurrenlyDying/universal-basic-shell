#!/usr/bin/env bash
set -euo pipefail

: "${HEADSCALE_URL:=https://ubs-headscale.fly.dev}"
: "${REGION:=unknown}"

echo "Starting volunteer node..."
echo "Region: ${REGION}"
echo "Headscale: ${HEADSCALE_URL}"

while true; do
  echo "heartbeat $(date -Iseconds)"
  sleep 240
done
