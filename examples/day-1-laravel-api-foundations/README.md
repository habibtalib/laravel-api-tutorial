# Day 1 Example Files - Laravel API Foundations

This folder contains the copyable code examples for Day 1 of the Laravel API training.

The files mirror the paths inside a fresh Laravel project named `abc-api`.

## How To Use

Create the Laravel project first:

```bash
composer create-project laravel/laravel abc-api
cd abc-api
php artisan install:api
```

Update `.env` using:

```text
examples/day-1-laravel-api-foundations/config/env.day1.example
```

Then copy these files into the Laravel project:

| Example file | Laravel destination |
| --- | --- |
| `routes/api.php` | `routes/api.php` |
| `app/Models/UserProfile.php` | `app/Models/UserProfile.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `database/migrations/2026_06_06_000001_create_user_profiles_table.php` | `database/migrations/2026_06_06_000001_create_user_profiles_table.php` |

Make sure the MySQL database exists before running migrations:

```sql
CREATE DATABASE abc_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run:

```bash
php artisan config:clear
php artisan migrate
```

Add sample data:

```bash
php artisan tinker
```

Then paste the code from:

```text
snippets/tinker-seed.php
```

Start Laravel:

```bash
php artisan serve
```

Test the endpoint:

```bash
bash examples/day-1-laravel-api-foundations/snippets/curl-test.sh
```

If you copied the examples into a different location, run the curl command manually:

```bash
curl http://127.0.0.1:8000/api/v1/users
```

Expected endpoint:

```text
GET /api/v1/users
```

## Files Included

- Laravel API route file
- `UserProfile` model
- `UserProfileController`
- `user_profiles` migration
- MySQL `.env` example
- Tinker seed snippet
- curl test script
