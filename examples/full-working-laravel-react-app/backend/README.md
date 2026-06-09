# Backend API

This is the Laravel backend for the full working Laravel + React training app.

## Setup

Create a MySQL database named `abc_api_full`, then run:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

SQL helper:

```bash
mysql -u root < database/schema/create_database.sql
```

Login credentials:

```text
Email: admin@example.com
Password: password
```

Required frontend token header:

```text
X-API-TOKEN: abc-training-frontend-token
```

Default bearer token lifetime:

```text
AUTH_TOKEN_EXPIRY_MINUTES=60
```

Login tokens include named abilities for profile CRUD: `profiles:read`, `profiles:create`, `profiles:update`, and `profiles:delete`.

## Smoke Test

```bash
bash scripts/curl-login.sh
TOKEN="paste-access-token-here" bash scripts/curl-crud.sh
```

## Key Files

- `routes/api.php`
- `app/Http/Controllers/Api/V1`
- `app/Http/Middleware/VerifyFrontendToken.php`
- `app/Http/Requests`
- `app/Http/Resources`
- `app/Services/UserProfileService.php`
- `database/migrations`
- `database/seeders/DatabaseSeeder.php`
