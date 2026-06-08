# Fail Contoh Hari 3 - API Security

Folder ini mengandungi fail Laravel yang boleh disalin untuk Hari 3.

Mulakan daripada projek Laravel Hari 2, kemudian salin atau merge fail ini ke dalam `abc-api`.

## Skop Security

CRUD Hari 2 sengaja public. Hari 3 menukar final route state:

- `POST /api/v1/auth/login` memerlukan `X-API-TOKEN` dan throttling, tetapi tidak memerlukan bearer token.
- `POST /api/v1/auth/logout` memerlukan `X-API-TOKEN`, throttling, dan `Authorization: Bearer ...`.
- Semua endpoint CRUD `/api/v1/users` memerlukan `X-API-TOKEN`, throttling, dan `Authorization: Bearer ...`.

Jangan tinggalkan `Route::apiResource('users', ...)` public daripada Hari 2 di luar protected group. Jika mana-mana CRUD Hari 3 berfungsi tanpa kedua-dua security headers, fail route masih salah.

## Fail

| Fail contoh | Destinasi Laravel |
| --- | --- |
| `routes/api.php` | `routes/api.php` |
| `app/Http/Controllers/Api/V1/AuthController.php` | `app/Http/Controllers/Api/V1/AuthController.php` |
| `app/Http/Middleware/VerifyFrontendToken.php` | `app/Http/Middleware/VerifyFrontendToken.php` |
| `app/Models/User.php` | `app/Models/User.php` |
| `bootstrap/app.php` | `bootstrap/app.php` |
| `config/services.frontend.example.php` | Merge ke dalam `config/services.php` |
| `config/env.day3.example` | Merge ke dalam `.env` |
| `snippets/curl-secured-crud.sh` | Run manual dari terminal |

## Artisan Commands

```bash
php artisan make:controller Api/V1/AuthController
php artisan make:middleware VerifyFrontendToken
php artisan migrate
```

## Nota Merge Penting

Jangan overwrite `config/services.php` jika app Laravel anda sudah mempunyai setting service lain. Tambah key ini sahaja:

```php
'frontend' => [
    'api_token' => env('FRONTEND_API_TOKEN'),
],
```

Jika `bootstrap/app.php` sudah mempunyai closure `withMiddleware`, tambah alias `frontend.token` sahaja di dalam closure sedia ada.

## Seed Test User

```bash
php artisan tinker
```

Paste:

```text
snippets/tinker-admin-user.php
```

## Test

Login:

```bash
bash bahasa-malaysia/examples/day-3-api-security/snippets/curl-login.sh
```

Copy token yang dipulangkan dan gunakan dalam:

```bash
TOKEN="PASTE_TOKEN_HERE" bash bahasa-malaysia/examples/day-3-api-security/snippets/curl-protected-users.sh
```

Run CRUD penuh yang secured dengan token yang sama:

```bash
TOKEN="PASTE_TOKEN_HERE" bash bahasa-malaysia/examples/day-3-api-security/snippets/curl-secured-crud.sh
```

Behavior security yang dijangka:

- `X-API-TOKEN` tiada memulangkan `401`.
- Bearer token tiada memulangkan `401`.
- Full CRUD hanya berfungsi apabila kedua-dua headers dihantar.
