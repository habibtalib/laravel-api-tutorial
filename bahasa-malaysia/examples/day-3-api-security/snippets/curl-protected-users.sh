#!/usr/bin/env bash

if [ -z "${TOKEN:-}" ]; then
  echo "Set TOKEN before running, for example:"
  echo "TOKEN=\"1|your-token\" bash bahasa-malaysia/examples/day-3-api-security/snippets/curl-protected-users.sh"
  exit 1
fi

curl http://127.0.0.1:8000/api/v1/users \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer $TOKEN"
