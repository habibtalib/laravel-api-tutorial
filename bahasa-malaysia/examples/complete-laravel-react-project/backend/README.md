# Fail Backend Lengkap

Salin fail ini ke projek Laravel baru selepas menjalankan:

```bash
composer create-project laravel/laravel abc-api
cd abc-api
php artisan install:api
```

## Peta Salin

| Source dalam folder ini | Destinasi dalam Laravel |
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

Merge `config/services.frontend.example.php` ke dalam `config/services.php`, kemudian salin nilai `.env` daripada `config/env.complete.example`.
Ini termasuk `AUTH_TOKEN_EXPIRY_MINUTES=60`, yang mengawal default lifetime Sanctum bearer token untuk app latihan.
Token login mempunyai named abilities untuk CRUD profile: `profiles:read`, `profiles:create`, `profiles:update`, dan `profiles:delete`.

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
