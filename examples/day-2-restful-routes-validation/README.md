# Day 2 Example Files - RESTful Routes, CRUD, And Validation

This folder contains copyable Laravel files for Day 2.

Start from the Day 1 Laravel project, then copy these files into `abc-api`.

## Authentication Scope

Day 2 CRUD is intentionally public for training. Do not add Sanctum, `auth:sanctum`, frontend token middleware, `X-API-TOKEN`, or `Authorization: Bearer ...` yet.

All Day 2 `GET`, `POST`, `PUT/PATCH`, and `DELETE` examples should work with only:

```text
Accept: application/json
Content-Type: application/json
```

Day 3 adds login and protected routes.

## Laragon/XAMPP Local Setup

Most learners can keep using Laragon or XAMPP for MySQL. For this example folder, use one consistent API base URL:

```text
http://127.0.0.1:8000/api/v1
```

Recommended `.env` database values:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=abc_api
DB_USERNAME=root
DB_PASSWORD=
```

If XAMPP MySQL runs on `3307`, change `DB_PORT=3307`. If you use a Laragon virtual host such as `http://abc-api.test`, update the React `VITE_API_BASE_URL` and all manual requests to `http://abc-api.test/api/v1`.

## Files

| Example file | Laravel destination |
| --- | --- |
| `routes/api.php` | `routes/api.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `app/Http/Requests/StoreUserProfileRequest.php` | `app/Http/Requests/StoreUserProfileRequest.php` |
| `app/Http/Requests/UpdateUserProfileRequest.php` | `app/Http/Requests/UpdateUserProfileRequest.php` |
| `snippets/curl-crud.sh` | Run manually from terminal |

## Artisan Commands

Run these before copying files if the classes do not exist yet:

```bash
php artisan make:request StoreUserProfileRequest
php artisan make:request UpdateUserProfileRequest
php artisan make:controller Api/V1/UserProfileController
```

## Check Routes

```bash
php artisan route:list --path=api/v1/users
```

Expected actions:

- `index`
- `store`
- `show`
- `update`
- `destroy`

## Test

Start Laravel:

```bash
php artisan serve
```

Run the CRUD curl examples:

```bash
bash examples/day-2-restful-routes-validation/snippets/curl-crud.sh
```

The curl script does not send auth headers. If a Day 2 request returns `401`, check that Day 3 middleware was not added too early.

Expected JSON response examples:

```json
{
  "message": "User profile created successfully.",
  "data": {
    "id": 1,
    "full_name": "Nur Iman",
    "phone": "+60112223333"
  }
}
```

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "full_name": [
      "The full name field is required."
    ]
  }
}
```
