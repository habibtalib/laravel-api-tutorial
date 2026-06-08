#!/usr/bin/env bash

set -e

if [ -z "${TOKEN:-}" ]; then
  echo "Set TOKEN sebelum run, contoh:"
  echo "TOKEN=\"1|your-token\" bash bahasa-malaysia/examples/day-3-api-security/snippets/curl-secured-crud.sh"
  exit 1
fi

BASE_URL="${BASE_URL:-http://127.0.0.1:8000/api/v1}"
FRONTEND_API_TOKEN="${FRONTEND_API_TOKEN:-abc-training-frontend-token}"
UNIQUE_ID="DAY3-$(date +%s)"

echo "CRUD secured Hari 3: X-API-TOKEN dan Authorization bearer token diperlukan."
echo

echo "Cipta secured profile"
CREATE_RESPONSE=$(curl -sS -X POST "$BASE_URL/users" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"full_name\": \"Day 3 Secure User\",
    \"phone\": \"+60123334444\",
    \"id_card_number\": \"$UNIQUE_ID\",
    \"address\": \"Kuala Lumpur\"
  }")
echo "$CREATE_RESPONSE"

PROFILE_ID=$(php -r '$json = json_decode(stream_get_contents(STDIN), true); echo $json["data"]["id"] ?? "";' <<< "$CREATE_RESPONSE")

if [ -z "$PROFILE_ID" ]; then
  echo "Tidak dapat baca id profile daripada response."
  exit 1
fi

echo
echo "Senarai secured profiles"
curl -sS "$BASE_URL/users" \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN"

echo
echo
echo "Papar secured profile $PROFILE_ID"
curl -sS "$BASE_URL/users/$PROFILE_ID" \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN"

echo
echo
echo "Update secured profile $PROFILE_ID"
curl -sS -X PUT "$BASE_URL/users/$PROFILE_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"full_name\": \"Day 3 Secure User\",
    \"phone\": \"+60129998888\",
    \"id_card_number\": \"$UNIQUE_ID\",
    \"address\": \"Cyberjaya\"
  }"

echo
echo
echo "Padam secured profile $PROFILE_ID"
curl -i -sS -X DELETE "$BASE_URL/users/$PROFILE_ID" \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN"
