#!/usr/bin/env bash

set -e

BASE_URL="http://127.0.0.1:8000/api/v1"

echo "CRUD Hari 2 public: tiada Authorization atau X-API-TOKEN headers dihantar."
echo

echo "Cipta profile"
curl -X POST "$BASE_URL/users" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nur Iman",
    "phone": "+60112223333",
    "id_card_number": "920202-08-4567",
    "address": "Shah Alam"
  }'

echo
echo "Senarai profiles"
curl "$BASE_URL/users" \
  -H "Accept: application/json"

echo
echo "Papar profile 1"
curl "$BASE_URL/users/1" \
  -H "Accept: application/json"

echo
echo "Update profile 1"
curl -X PATCH "$BASE_URL/users/1" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+60129998888",
    "address": "Cyberjaya"
  }'

echo
echo "Contoh validation error"
curl -X POST "$BASE_URL/users" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "",
    "phone": ""
  }'

echo
echo "Padam profile 1"
curl -X DELETE "$BASE_URL/users/1" \
  -H "Accept: application/json"
