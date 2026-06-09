# Fail Contoh Bonus - Swagger Dan OpenAPI

Folder ini mengandungi fail Laravel yang boleh disalin untuk modul bonus Swagger/OpenAPI.

Mulakan daripada projek Laravel Hari 5, kemudian install L5-Swagger dan salin atau merge fail ini ke dalam `abc-api`.

## Install L5-Swagger

```bash
composer require darkaonline/l5-swagger
php artisan vendor:publish --provider "L5Swagger\\L5SwaggerServiceProvider"
```

## Fail

| Fail contoh | Destinasi Laravel |
| --- | --- |
| `app/OpenApi/OpenApiSpec.php` | `app/OpenApi/OpenApiSpec.php` |
| `app/OpenApi/Schemas.php` | `app/OpenApi/Schemas.php` |
| `app/Http/Controllers/Api/V1/AuthController.php` | `app/Http/Controllers/Api/V1/AuthController.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `app/Services/UserProfileService.php` | `app/Services/UserProfileService.php` |
| `config/env.swagger.example` | Merge ke dalam `.env` |
| `tests/Feature/OpenApiDocumentationTest.php` | `tests/Feature/OpenApiDocumentationTest.php` |
| `snippets/generate-docs.sh` | Run manual dari terminal |

## Semak Config

Pastikan `config/l5-swagger.php` scan direktori `app`:

```php
'annotations' => [
    base_path('app'),
],
```

## Generate Docs

```bash
bash examples/bonus-swagger-openapi/snippets/generate-docs.sh
```

Buka:

```text
http://127.0.0.1:8000/api/documentation
```

## Security Schemes

Contoh ini mendokumentasi kedua-dua layer security API:

- `Authorization: Bearer <token>`
- `X-API-TOKEN: abc-training-frontend-token`

Service yang disalin juga menyokong filter `active`:

```text
GET /api/v1/users?active=1
```
