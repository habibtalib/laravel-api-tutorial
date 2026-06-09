#!/usr/bin/env bash

set -e

php artisan config:clear
php artisan test --filter=AuthApiTest
php artisan test --filter=UserProfileApiTest
php artisan test
