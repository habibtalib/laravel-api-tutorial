# Fail Contoh Hari 2 - RESTful Routes, CRUD, Dan Validation

Folder ini mengandungi fail Laravel yang boleh disalin untuk Hari 2.

Mulakan daripada projek Laravel Hari 1, kemudian salin fail ini ke dalam `abc-api`.

## Skop Authentication

CRUD Hari 2 sengaja public untuk latihan. Jangan tambah Sanctum, `auth:sanctum`, frontend token middleware, `X-API-TOKEN`, atau `Authorization: Bearer ...` lagi.

Semua contoh `GET`, `POST`, `PUT/PATCH`, dan `DELETE` Hari 2 sepatutnya berfungsi hanya dengan:

```text
Accept: application/json
Content-Type: application/json
```

Hari 3 barulah menambah login dan protected routes.

## Setup Local Laragon/XAMPP

Kebanyakan peserta boleh terus menggunakan Laragon atau XAMPP untuk MySQL. Untuk folder contoh ini, gunakan satu API base URL yang konsisten:

```text
http://127.0.0.1:8000/api/v1
```

Nilai database `.env` yang dicadangkan:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=abc_api
DB_USERNAME=root
DB_PASSWORD=
```

Jika XAMPP MySQL berjalan pada `3307`, ubah `DB_PORT=3307`. Jika anda guna virtual host Laragon seperti `http://abc-api.test`, update React `VITE_API_BASE_URL` dan semua request manual kepada `http://abc-api.test/api/v1`.

## Fail

| Fail contoh | Destinasi Laravel |
| --- | --- |
| `routes/api.php` | `routes/api.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `app/Http/Requests/StoreUserProfileRequest.php` | `app/Http/Requests/StoreUserProfileRequest.php` |
| `app/Http/Requests/UpdateUserProfileRequest.php` | `app/Http/Requests/UpdateUserProfileRequest.php` |
| `snippets/curl-crud.sh` | Run manual dari terminal |

## Artisan Commands

Run command ini sebelum menyalin fail jika class belum wujud:

```bash
php artisan make:request StoreUserProfileRequest
php artisan make:request UpdateUserProfileRequest
php artisan make:controller Api/V1/UserProfileController
```

## Semak Routes

```bash
php artisan route:list --path=api/v1/users
```

Actions dijangka:

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

Run contoh CRUD curl:

```bash
bash examples/day-2-restful-routes-validation/snippets/curl-crud.sh
```

Script curl ini tidak menghantar auth headers. Jika request Hari 2 memulangkan `401`, semak sama ada middleware Hari 3 telah ditambah terlalu awal.

Contoh response JSON dijangka:

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
