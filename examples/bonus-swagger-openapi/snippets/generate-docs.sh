#!/usr/bin/env bash

set -e

php artisan config:clear
php artisan l5-swagger:generate

echo "Open http://127.0.0.1:8000/api/documentation"
