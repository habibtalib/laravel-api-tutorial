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

## Prompt AI - Setup Swagger Dan Populate API Docs

Gunakan prompt ini daripada root projek Laravel apabila mahu Claude Code memasang Swagger/OpenAPI, merge fail contoh ini, dan generate docs yang lengkap.

```text
Goal:
Set up Swagger/OpenAPI documentation for my Laravel API and populate /api/documentation.

Reference example folder:
https://github.com/habibtalib/laravel-api-tutorial/tree/master/examples/bonus-swagger-openapi

Context:
The API is the Day 5 ABC Company Profile API with /api/v1 routes, Sanctum bearer tokens, X-API-TOKEN frontend middleware, user profile CRUD, pagination, search, active filtering, API resources, service classes, and JSON error responses.

Tasks:
1. Inspect current routes, controllers, form requests, resources, services, and middleware.
2. Install and publish L5-Swagger if missing.
3. Configure .env and config/l5-swagger.php so app annotations are scanned.
4. Merge the example OpenAPI files and controller attributes from examples/bonus-swagger-openapi.
5. Document login, logout, list, create, show, update, and delete endpoints.
6. Document page, search, and active query parameters on GET /api/v1/users.
7. Document both security headers: Authorization bearer token and X-API-TOKEN.
8. Run php artisan l5-swagger:generate.
9. Verify storage/api-docs/api-docs.json exists and /api/documentation is populated.
10. Run or add OpenApiDocumentationTest if tests are available.

Constraints:
- Do not remove existing auth, frontend token, token abilities, validation, resources, service layer, or JSON exception handling.
- Do not put real production tokens or secrets in examples.
- Inspect actual response shapes before documenting them.
```

## Security Schemes

Contoh ini mendokumentasi kedua-dua layer security API:

- `Authorization: Bearer <token>`
- `X-API-TOKEN: abc-training-frontend-token`

Service yang disalin juga menyokong filter `active`:

```text
GET /api/v1/users?active=1
```
