#!/usr/bin/env bash

if [ -z "${TOKEN:-}" ]; then
  echo "Set TOKEN before running. Token mesti ada profiles:read."
  exit 1
fi

FRONTEND_API_TOKEN="${FRONTEND_API_TOKEN:-abc-training-frontend-token}"
API_URL="${API_URL:-http://127.0.0.1:8000/api/v1/users}"
SEARCH="${SEARCH:-}"

curl --get "$API_URL" \
  --data-urlencode "page=1" \
  --data-urlencode "search=$SEARCH" \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN"
