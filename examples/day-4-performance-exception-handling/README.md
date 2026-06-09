# Day 4 Example Files - Performance And Exception Handling

This folder contains copyable Laravel files for Day 4.

Start from the Day 3 Laravel project, then copy or merge these files into `abc-api`.

Day 4 must not weaken Day 3 security. The copied `routes/api.php` keeps:

- `frontend.token` on the `/api/v1` group.
- `auth:sanctum` on logout and profile CRUD.
- per-action token abilities: `profiles:read`, `profiles:create`, `profiles:update`, and `profiles:delete`.

The copied `bootstrap/app.php` also keeps the Sanctum `abilities` middleware aliases and adds JSON rendering for `403`, `404`, and `422`.

## Files

| Example file | Laravel destination |
| --- | --- |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `app/Models/Project.php` | `app/Models/Project.php` |
| `app/Models/UserProfile.php` | `app/Models/UserProfile.php` |
| `bootstrap/app.php` | `bootstrap/app.php` |
| `database/migrations/2026_06_06_000002_create_projects_table.php` | `database/migrations/2026_06_06_000002_create_projects_table.php` |
| `routes/api.php` | `routes/api.php` |
| `config/env.redis.example` | Optional Redis `.env` values |

## Artisan Commands

```bash
php artisan make:model Project -m
php artisan migrate
```

If using Redis:

```bash
composer require predis/predis
php artisan config:clear
```

## Seed Projects

```bash
php artisan tinker
```

Paste:

```text
snippets/tinker-projects.php
```

## Test

Use a valid Sanctum token with `profiles:read`:

```bash
TOKEN="PASTE_TOKEN_HERE" bash examples/day-4-performance-exception-handling/snippets/curl-list.sh
TOKEN="PASTE_TOKEN_HERE" bash examples/day-4-performance-exception-handling/snippets/curl-404.sh
```

To test missing ability behavior after the Day 3 update, use a token without `profiles:read` and expect a JSON `403`.
