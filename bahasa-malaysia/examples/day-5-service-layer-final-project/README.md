# Fail Contoh Hari 5 - Struktur API Akhir

Folder ini mengandungi fail Laravel akhir yang boleh disalin untuk Hari 5.

Mulakan daripada projek Laravel Hari 4, kemudian salin atau merge fail ini ke dalam `abc-api`.

Hari 5 ialah struktur projek akhir. Folder ini mengandungi fail utama daripada hari sebelumnya serta service layer, route model binding, dan API resources.

## Fail

| Fail contoh | Destinasi Laravel |
| --- | --- |
| `routes/api.php` | `routes/api.php` |
| `bootstrap/app.php` | `bootstrap/app.php` |
| `app/Http/Controllers/Api/V1/AuthController.php` | `app/Http/Controllers/Api/V1/AuthController.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `app/Http/Middleware/VerifyFrontendToken.php` | `app/Http/Middleware/VerifyFrontendToken.php` |
| `app/Http/Requests/StoreUserProfileRequest.php` | `app/Http/Requests/StoreUserProfileRequest.php` |
| `app/Http/Requests/UpdateUserProfileRequest.php` | `app/Http/Requests/UpdateUserProfileRequest.php` |
| `app/Http/Resources/UserProfileResource.php` | `app/Http/Resources/UserProfileResource.php` |
| `app/Http/Resources/ProjectResource.php` | `app/Http/Resources/ProjectResource.php` |
| `app/Models/Project.php` | `app/Models/Project.php` |
| `app/Models/User.php` | `app/Models/User.php` |
| `app/Models/UserProfile.php` | `app/Models/UserProfile.php` |
| `app/Services/UserProfileService.php` | `app/Services/UserProfileService.php` |
| `database/migrations/*.php` | `database/migrations/*.php` |

## Artisan Commands

Run command ini jika fail/class belum wujud:

```bash
php artisan make:controller Api/V1/AuthController
php artisan make:controller Api/V1/UserProfileController
php artisan make:middleware VerifyFrontendToken
php artisan make:request StoreUserProfileRequest
php artisan make:request UpdateUserProfileRequest
php artisan make:resource UserProfileResource
php artisan make:resource ProjectResource
php artisan make:model Project -m
```

## Flow Test Akhir

```bash
php artisan config:clear
php artisan migrate
php artisan serve
```

Create test admin user jika perlu:

```bash
php artisan tinker
```

Paste:

```text
snippets/tinker-admin-user.php
```

Login:

```bash
bash examples/day-5-service-layer-final-project/snippets/curl-login.sh
```

Run contoh CRUD akhir:

```bash
TOKEN="PASTE_TOKEN_HERE" bash examples/day-5-service-layer-final-project/snippets/curl-final-crud.sh
```

## Integrasi React Client

Selepas final API berfungsi dengan curl, gunakan:

```text
examples/react-client-api-consumer
```

React client perlu login, simpan Sanctum token untuk lab local, list profiles, apply search/filter values, create profile, dan memaparkan API errors.
