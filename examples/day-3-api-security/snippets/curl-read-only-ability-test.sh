#!/usr/bin/env bash

set -e

if [ -z "${TOKEN:-}" ]; then
  echo "Set TOKEN to the read-only token before running, for example:"
  echo "TOKEN=\"1|read-only-token\" bash examples/day-3-api-security/snippets/curl-read-only-ability-test.sh"
  exit 1
fi

BASE_URL="${BASE_URL:-http://127.0.0.1:8000/api/v1}"
FRONTEND_API_TOKEN="${FRONTEND_API_TOKEN:-abc-training-frontend-token}"

echo "Read-only token should list profiles successfully."
curl -i -sS "$BASE_URL/users" \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN"

echo
echo
echo "The same read-only token should fail create with 403."
curl -i -sS -X POST "$BASE_URL/users" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "full_name": "Read Only Should Fail",
    "id_card_number": "READONLY-001",
    "phone": "+60120000000",
    "address": "Kuala Lumpur"
  }'
