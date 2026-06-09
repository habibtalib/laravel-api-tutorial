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

## Security Schemes

The examples document both API security layers:

- `Authorization: Bearer <token>`
- `X-API-TOKEN: abc-training-frontend-token`

The copied service also supports the documented `active` filter:

```text
GET /api/v1/users?active=1
```
