# Fail Contoh Hari 3 - API Security

Folder ini mengandungi fail Laravel yang boleh disalin untuk Hari 3.

Mulakan daripada projek Laravel Hari 2, kemudian salin atau merge fail ini ke dalam `abc-api`.

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
bash examples/day-3-api-security/snippets/curl-login.sh
```

Copy token yang dipulangkan dan gunakan dalam:

```bash
TOKEN="PASTE_TOKEN_HERE" bash examples/day-3-api-security/snippets/curl-protected-users.sh
```
