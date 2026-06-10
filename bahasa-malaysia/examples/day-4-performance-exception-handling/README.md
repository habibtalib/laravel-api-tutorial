# Fail Contoh Hari 4 - Performance Dan Exception Handling

Folder ini mengandungi fail Laravel yang boleh disalin untuk Hari 4.

Mulakan daripada projek Laravel Hari 3, kemudian salin atau merge fail ini ke dalam `abc-api`.

Hari 4 tidak boleh melemahkan security Hari 3. Fail `routes/api.php` yang disalin masih mengekalkan:

- `frontend.token` pada group `/api/v1`.
- `auth:sanctum` pada logout dan CRUD profile.
- token abilities mengikut action: `profiles:read`, `profiles:create`, `profiles:update`, dan `profiles:delete`.

Fail `bootstrap/app.php` yang disalin juga mengekalkan alias middleware Sanctum `abilities` dan menambah JSON rendering untuk `403`, `404`, dan `422`.

## Fail

| Fail contoh | Destinasi Laravel |
| --- | --- |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `app/Http/Resources/ProjectResource.php` | `app/Http/Resources/ProjectResource.php` |
| `app/Http/Resources/UserProfileResource.php` | `app/Http/Resources/UserProfileResource.php` |
| `app/Models/Project.php` | `app/Models/Project.php` |
| `app/Models/UserProfile.php` | `app/Models/UserProfile.php` |
| `bootstrap/app.php` | `bootstrap/app.php` |
| `database/migrations/2026_06_06_000002_create_projects_table.php` | `database/migrations/2026_06_06_000002_create_projects_table.php` |
| `routes/api.php` | `routes/api.php` |
| `config/env.redis.example` | Nilai `.env` Redis pilihan |

## Artisan Commands

```bash
php artisan make:model Project -m
php artisan make:resource ProjectResource
php artisan make:resource UserProfileResource
php artisan migrate
```

Jika menggunakan Redis:

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

Gunakan token Sanctum yang sah dan ada `profiles:read`:

```bash
TOKEN="PASTE_TOKEN_HERE" bash bahasa-malaysia/examples/day-4-performance-exception-handling/snippets/curl-list.sh
TOKEN="PASTE_TOKEN_HERE" bash bahasa-malaysia/examples/day-4-performance-exception-handling/snippets/curl-404.sh
```

Untuk test missing ability selepas update Hari 3, gunakan token tanpa `profiles:read` dan jangka JSON `403`.
