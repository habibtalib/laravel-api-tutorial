# Bonus Example Files - Swagger And OpenAPI

This folder contains copyable Laravel files for the Swagger/OpenAPI bonus module.

Start from the Day 5 Laravel project, then install L5-Swagger and copy or merge these files into `abc-api`.

## Install L5-Swagger

```bash
composer require darkaonline/l5-swagger
php artisan vendor:publish --provider "L5Swagger\\L5SwaggerServiceProvider"
```

## Files

| Example file | Laravel destination |
| --- | --- |
| `app/OpenApi/OpenApiSpec.php` | `app/OpenApi/OpenApiSpec.php` |
| `app/OpenApi/Schemas.php` | `app/OpenApi/Schemas.php` |
| `app/Http/Controllers/Api/V1/AuthController.php` | `app/Http/Controllers/Api/V1/AuthController.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `app/Services/UserProfileService.php` | `app/Services/UserProfileService.php` |
| `config/env.swagger.example` | Merge into `.env` |
| `tests/Feature/OpenApiDocumentationTest.php` | `tests/Feature/OpenApiDocumentationTest.php` |
| `snippets/generate-docs.sh` | Run manually from terminal |

## Config Check

Make sure `config/l5-swagger.php` scans the `app` directory:

```php
'annotations' => [
    base_path('app'),
],
```

## Generate Docs

```bash
bash examples/bonus-swagger-openapi/snippets/generate-docs.sh
```

Open:

```text
http://127.0.0.1:8000/api/documentation
```

## AI Prompt - Setup Swagger And Populate API Docs

Use this prompt from the Laravel project root when you want Claude Code to install Swagger/OpenAPI support, merge these example files, and generate populated docs.

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

The examples document both API security layers:

- `Authorization: Bearer <token>`
- `X-API-TOKEN: abc-training-frontend-token`

The copied service also supports the documented `active` filter:

```text
GET /api/v1/users?active=1
```
