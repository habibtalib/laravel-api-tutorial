#!/usr/bin/env bash

set -e

if [ -z "${TOKEN:-}" ]; then
  echo "Set TOKEN before running, for example:"
  echo "TOKEN=\"1|your-token\" bash examples/day-3-api-security/snippets/curl-secured-crud.sh"
  exit 1
fi

BASE_URL="${BASE_URL:-http://127.0.0.1:8000/api/v1}"
FRONTEND_API_TOKEN="${FRONTEND_API_TOKEN:-abc-training-frontend-token}"
UNIQUE_ID="DAY3-$(date +%s)"

echo "Day 3 secured CRUD: X-API-TOKEN and Authorization bearer token are required."
echo

echo "Create secured profile"
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
  echo "Could not read created profile id from response."
  exit 1
fi

echo
echo "List secured profiles"
curl -sS "$BASE_URL/users" \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN"

echo
echo
echo "Show secured profile $PROFILE_ID"
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
echo "Delete secured profile $PROFILE_ID"
curl -i -sS -X DELETE "$BASE_URL/users/$PROFILE_ID" \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: $FRONTEND_API_TOKEN" \
  -H "Authorization: Bearer $TOKEN"
