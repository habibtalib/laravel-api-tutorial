# Fail Contoh Hari 1 - Asas Laravel API

Folder ini mengandungi contoh kod yang boleh disalin untuk Hari 1 latihan Laravel API.

Fail disusun mengikut path dalam projek Laravel baru bernama `abc-api`.

## Cara Guna

Create projek Laravel dahulu:

```bash
composer create-project laravel/laravel abc-api
cd abc-api
php artisan install:api
```

Update `.env` menggunakan:

```text
examples/day-1-laravel-api-foundations/config/env.day1.example
```

Kemudian salin fail ini ke dalam projek Laravel:

| Fail contoh | Destinasi Laravel |
| --- | --- |
| `routes/api.php` | `routes/api.php` |
| `app/Models/UserProfile.php` | `app/Models/UserProfile.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `database/migrations/2026_06_06_000001_create_user_profiles_table.php` | `database/migrations/2026_06_06_000001_create_user_profiles_table.php` |

Pastikan database MySQL sudah wujud sebelum menjalankan migrations:

```sql
CREATE DATABASE abc_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run:

```bash
php artisan config:clear
php artisan migrate
```

Tambah sample data:

```bash
php artisan tinker
```

Kemudian paste kod daripada:

```text
snippets/tinker-seed.php
```

Start Laravel:

```bash
php artisan serve
```

Test endpoint:

```bash
bash examples/day-1-laravel-api-foundations/snippets/curl-test.sh
```

Jika anda menyalin contoh ke lokasi lain, hantar request secara manual:

```bash
curl http://127.0.0.1:8000/api/v1/users \
  -H "Accept: application/json"
```

Jangkaan bentuk response JSON:

```json
{
  "message": "User profiles retrieved successfully.",
  "data": [
    {
      "id": 1,
      "full_name": "Ali Ahmad",
      "phone": "+60123456789"
    }
  ]
}
```

## Fail Disertakan

- Fail route Laravel API
- model `UserProfile`
- `UserProfileController`
- migration `user_profiles`
- contoh MySQL `.env`
- snippet seed Tinker
- script test response JSON
