#!/usr/bin/env bash

set -e

if [ -z "${TOKEN:-}" ]; then
  echo "Set TOKEN before running, for example:"
  echo "TOKEN=\"1|your-token\" bash examples/complete-laravel-react-project/backend/scripts/curl-crud.sh"
  exit 1
fi

BASE_URL="${BASE_URL:-http://127.0.0.1:8000/api/v1}"
FRONTEND_API_TOKEN="${FRONTEND_API_TOKEN:-abc-training-frontend-token}"
UNIQUE_ID="COMPLETE-$(date +%s)"
COMMON_HEADERS=(
  -H "Accept: application/json"
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN"
  -H "Authorization: Bearer $TOKEN"
)

echo "List seeded profiles with search"
curl -sS "$BASE_URL/users?search=aina" "${COMMON_HEADERS[@]}"

echo
echo
echo "Create profile"
CREATE_RESPONSE=$(curl -sS -X POST "$BASE_URL/users" \
  "${COMMON_HEADERS[@]}" \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"Sofia Lim\",
    \"phone\": \"+60135556666\",
    \"id_card_number\": \"$UNIQUE_ID\",
    \"address\": \"Bangsar\",
    \"is_active\": true
  }")
echo "$CREATE_RESPONSE"

PROFILE_ID=$(php -r '$json = json_decode(stream_get_contents(STDIN), true); echo $json["data"]["id"] ?? "";' <<< "$CREATE_RESPONSE")

if [ -z "$PROFILE_ID" ]; then
  echo "Could not read created profile id from response."
  exit 1
fi

echo
echo "Show profile $PROFILE_ID"
curl -sS "$BASE_URL/users/$PROFILE_ID" "${COMMON_HEADERS[@]}"

echo
echo
echo "Update profile $PROFILE_ID"
curl -sS -X PUT "$BASE_URL/users/$PROFILE_ID" \
  "${COMMON_HEADERS[@]}" \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"Sofia Lim\",
    \"phone\": \"+60135556666\",
    \"id_card_number\": \"$UNIQUE_ID\",
    \"address\": \"Mont Kiara\",
    \"is_active\": true
  }"

echo
echo
echo "Delete profile $PROFILE_ID"
curl -i -sS -X DELETE "$BASE_URL/users/$PROFILE_ID" "${COMMON_HEADERS[@]}"
