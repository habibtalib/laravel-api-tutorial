# Day 3 Example Files - API Security

This folder contains copyable Laravel files for Day 3.

Start from the Day 2 Laravel project, then copy or merge these files into `abc-api`.

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

If `bootstrap/app.php` already has a `withMiddleware` closure, add only the `frontend.token` alias inside the existing closure.

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

