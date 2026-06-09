#!/usr/bin/env bash

if [ -z "${TOKEN:-}" ]; then
  echo "Set TOKEN before running. The token must include profiles:read."
  exit 1
fi

FRONTEND_API_TOKEN="${FRONTEND_API_TOKEN:-abc-training-frontend-token}"

curl "http://127.0.0.1:8000/api/v1/users?page=1" \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN"
