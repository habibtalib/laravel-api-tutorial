#!/usr/bin/env bash

set -e

if [ -z "${TOKEN:-}" ]; then
  echo "Set TOKEN before running."
  exit 1
fi

BASE_URL="http://127.0.0.1:8000/api/v1"
COMMON_HEADERS=(
  -H "Accept: application/json"
  -H "X-API-TOKEN: abc-training-frontend-token"
  -H "Authorization: Bearer $TOKEN"
)

echo "List profiles"
curl "$BASE_URL/users" "${COMMON_HEADERS[@]}"

echo
echo "Create profile"
curl -X POST "$BASE_URL/users" \
  "${COMMON_HEADERS[@]}" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Sofia Lim",
    "phone": "+60135556666",
    "id_card_number": "950303-10-3333",
    "address": "Bangsar",
    "is_active": true
  }'

echo
echo "Show profile 1"
curl "$BASE_URL/users/1" "${COMMON_HEADERS[@]}"

echo
echo "Update profile 1"
curl -X PATCH "$BASE_URL/users/1" \
  "${COMMON_HEADERS[@]}" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Mont Kiara"
  }'
