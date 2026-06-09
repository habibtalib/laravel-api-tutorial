# Day 3 Example Files - API Security

This folder contains copyable Laravel files for Day 3.

Start from the Day 2 Laravel project, then copy or merge these files into `abc-api`.

## Security Scope

Day 2 CRUD was intentionally public. Day 3 changes that final route state:

- `POST /api/v1/auth/login` requires `X-API-TOKEN` and throttling, but not a bearer token.
- Login returns a Sanctum bearer token plus `expires_at` and named abilities. The default training token lifetime is 60 minutes.
- `POST /api/v1/auth/logout` requires `X-API-TOKEN`, throttling, and `Authorization: Bearer ...`.
- Every `/api/v1/users` CRUD endpoint requires `X-API-TOKEN`, throttling, `Authorization: Bearer ...`, and the matching Sanctum ability.

Do not leave the old Day 2 public `Route::apiResource('users', ...)` outside the protected group. If any Day 3 CRUD endpoint works without both security headers and the required token ability, the route file is still wrong.

## Files

| Example file | Laravel destination |
| --- | --- |
| `routes/api.php` | `routes/api.php` |
| `app/Http/Controllers/Api/V1/AuthController.php` | `app/Http/Controllers/Api/V1/AuthController.php` |
| `app/Http/Middleware/VerifyFrontendToken.php` | `app/Http/Middleware/VerifyFrontendToken.php` |
| `app/Models/User.php` | `app/Models/User.php` |
| `bootstrap/app.php` | `bootstrap/app.php` |
| `config/services.frontend.example.php` | Merge into `config/services.php` |
| `config/env.day3.example` | Merge into `.env` |
| `snippets/curl-secured-crud.sh` | Run manually from terminal |
| `snippets/curl-read-only-ability-test.sh` | Optional ability check with a read-only token |
| `snippets/tinker-expire-latest-token.php` | Optional fast expiry test in Tinker |
| `snippets/tinker-read-only-token.php` | Optional read-only token setup in Tinker |

## Artisan Commands

```bash
php artisan make:controller Api/V1/AuthController
php artisan make:middleware VerifyFrontendToken
php artisan migrate
```

## Important Merge Notes

Do not blindly overwrite `config/services.php` if your Laravel app already has other service settings. Add only this key:

```php
'frontend' => [
    'api_token' => env('FRONTEND_API_TOKEN'),
],
```

If `bootstrap/app.php` already has a `withMiddleware` closure, add only the new aliases inside the existing closure. Day 3 needs `frontend.token`, `abilities`, and `ability`.

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

Copy the returned token and use it in:

```bash
TOKEN="PASTE_TOKEN_HERE" bash examples/day-3-api-security/snippets/curl-protected-users.sh
```

Run full secured CRUD with the same token:

```bash
TOKEN="PASTE_TOKEN_HERE" bash examples/day-3-api-security/snippets/curl-secured-crud.sh
```

To test token abilities, paste `snippets/tinker-read-only-token.php` into Tinker, then run:

```bash
TOKEN="PASTE_READ_ONLY_TOKEN_HERE" bash examples/day-3-api-security/snippets/curl-read-only-ability-test.sh
```

Expected security behavior:

- Missing `X-API-TOKEN` returns `401`.
- Missing bearer token returns `401`.
- Expired bearer token returns `401`.
- A token missing the required ability returns `403`.
- Full CRUD works only when both headers are sent and the bearer token has the required ability.

To test expiry quickly, paste `snippets/tinker-expire-latest-token.php` into Tinker after login, then repeat a protected request with the old token.
