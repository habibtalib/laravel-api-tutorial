# Complete Backend Files

Copy these files into a fresh Laravel project after running:

```bash
composer create-project laravel/laravel abc-api
cd abc-api
php artisan install:api
```

## Copy Map

| Source in this folder | Destination in Laravel |
| --- | --- |
| `app/Http/Controllers/Api/V1/AuthController.php` | `app/Http/Controllers/Api/V1/AuthController.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `app/Http/Middleware/VerifyFrontendToken.php` | `app/Http/Middleware/VerifyFrontendToken.php` |
| `app/Http/Requests/*.php` | `app/Http/Requests/` |
| `app/Http/Resources/*.php` | `app/Http/Resources/` |
| `app/Models/*.php` | `app/Models/` |
| `app/Services/UserProfileService.php` | `app/Services/UserProfileService.php` |
| `bootstrap/app.php` | `bootstrap/app.php` |
| `database/migrations/*.php` | `database/migrations/` |
| `database/seeders/DatabaseSeeder.php` | `database/seeders/DatabaseSeeder.php` |
| `routes/api.php` | `routes/api.php` |

Merge `config/services.frontend.example.php` into `config/services.php`, then copy the `.env` values from `config/env.complete.example`.
This includes `AUTH_TOKEN_EXPIRY_MINUTES=60`, which controls the default Sanctum bearer token lifetime for the training app.
Login tokens include named abilities for profile CRUD: `profiles:read`, `profiles:create`, `profiles:update`, and `profiles:delete`.

## Run

```bash
php artisan config:clear
php artisan migrate:fresh --seed
php artisan serve
```

Seeded credentials:

```text
admin@example.com
password
```
