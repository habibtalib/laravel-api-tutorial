# Bonus - Swagger And OpenAPI Documentation For The Laravel API

## Bonus Goal

This bonus tutorial adds Swagger/OpenAPI documentation to the ABC Company Profile API. Students will document the existing Laravel API, generate an OpenAPI specification, view it in Swagger UI, and describe the API security requirements for both Sanctum bearer tokens and the custom `X-API-TOKEN` frontend token.

Use this module after Day 5, or teach it as a final documentation session after the TDD bonus.

## Swagger vs OpenAPI

The names are often used together, but they are not exactly the same:

- OpenAPI is the specification format that describes the API contract.
- Swagger UI is a browser interface that reads an OpenAPI document and makes it interactive.
- L5-Swagger is a Laravel-friendly wrapper around `swagger-php` and Swagger UI.

In this lesson, "Swagger" means the interactive documentation UI, and "OpenAPI" means the generated API contract.

## 6-Hour Bonus Class Plan

| Time | Topic | Activity |
| --- | --- | --- |
| 00:00-00:30 | API documentation concepts | Explain OpenAPI, Swagger UI, schemas, paths, and security schemes |
| 00:30-01:15 | Install L5-Swagger | Install package, publish config, generate first docs |
| 01:15-02:00 | Global OpenAPI metadata | Add API title, version, server, and security definitions |
| 02:00-02:15 | Break | Short break |
| 02:15-03:30 | Document profile endpoints | Add OpenAPI attributes for list, create, show, update, and delete |
| 03:30-04:30 | Document auth endpoints | Add login and logout docs |
| 04:30-05:15 | Generate and review docs | Generate spec, open Swagger UI, test protected endpoints |
| 05:15-06:00 | Documentation quality review | Validate response shapes, status codes, examples, and security |

## Learning Objectives

- Explain what OpenAPI documentation is.
- Install and configure L5-Swagger.
- Add OpenAPI metadata for a Laravel API.
- Document request bodies, query parameters, path parameters, and responses.
- Define bearer token and API key security schemes.
- Generate Swagger documentation.
- Review and maintain API docs as part of development.

## Recommended Tooling

This module uses:

```bash
composer require darkaonline/l5-swagger
```

L5-Swagger wraps:

- `swagger-php` for scanning PHP code and generating OpenAPI.
- Swagger UI for viewing the generated documentation in the browser.

For modern PHP, prefer PHP 8 attributes where possible:

```php
use OpenApi\Attributes as OA;
```

Docblock annotations still work, but attributes are cleaner for new Laravel projects.

## Step 1 - Install L5-Swagger

From the Laravel project root:

```bash
composer require darkaonline/l5-swagger
```

Publish the package config and assets:

```bash
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

Generate the first documentation output:

```bash
php artisan l5-swagger:generate
```

Open the docs:

```text
http://127.0.0.1:8000/api/documentation
```

If the server is not running:

```bash
php artisan serve
```

## Step 2 - Configure Environment Values

Add to `.env`:

```env
L5_SWAGGER_GENERATE_ALWAYS=false
L5_SWAGGER_CONST_HOST=http://127.0.0.1:8000
```

For local development, you can temporarily set:

```env
L5_SWAGGER_GENERATE_ALWAYS=true
```

For production, keep it false and generate documentation during deployment:

```bash
php artisan l5-swagger:generate
```

Clear config after `.env` changes:

```bash
php artisan config:clear
```

## Step 3 - Create A Global OpenAPI Definition

Create:

```text
app/OpenApi/OpenApiSpec.php
```

Add:

```php
<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\OpenApi(
    openapi: '3.0.3',
    security: [
        ['sanctum' => [], 'frontendToken' => []],
    ]
)]
#[OA\Info(
    version: '1.0.0',
    title: 'ABC Company Profile API',
    description: 'Training API for building secure and maintainable Laravel APIs.'
)]
#[OA\Server(
    url: 'http://127.0.0.1:8000',
    description: 'Local development server'
)]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Sanctum token',
    description: 'Use the token returned from POST /api/v1/auth/login.'
)]
#[OA\SecurityScheme(
    securityScheme: 'frontendToken',
    type: 'apiKey',
    in: 'header',
    name: 'X-API-TOKEN',
    description: 'Frontend API token required by the Laravel middleware.'
)]
class OpenApiSpec
{
}
```

This defines two security schemes:

- `sanctum`: sent as `Authorization: Bearer <token>`.
- `frontendToken`: sent as `X-API-TOKEN: <token>`.

The global `security` block means protected endpoints require both headers unless an endpoint overrides the security requirement.

## Step 4 - Add Reusable Schemas

Create:

```text
app/OpenApi/Schemas.php
```

Add:

```php
<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'UserProfile',
    type: 'object',
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'full_name', type: 'string', example: 'Aina Rahman'),
        new OA\Property(property: 'phone', type: 'string', example: '+60123456789'),
        new OA\Property(property: 'id_card_number', type: 'string', example: '900101-14-1234'),
        new OA\Property(property: 'address', type: 'string', nullable: true, example: 'Kuala Lumpur'),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time'),
    ]
)]
#[OA\Schema(
    schema: 'StoreUserProfileRequest',
    required: ['full_name', 'phone', 'id_card_number'],
    type: 'object',
    properties: [
        new OA\Property(property: 'full_name', type: 'string', example: 'Aina Rahman'),
        new OA\Property(property: 'phone', type: 'string', example: '+60123456789'),
        new OA\Property(property: 'id_card_number', type: 'string', example: '900101-14-1234'),
        new OA\Property(property: 'address', type: 'string', nullable: true, example: 'Kuala Lumpur'),
        new OA\Property(property: 'is_active', type: 'boolean', example: true),
    ]
)]
#[OA\Schema(
    schema: 'ValidationError',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'The given data was invalid.'),
        new OA\Property(
            property: 'errors',
            type: 'object',
            example: [
                'full_name' => ['The full name field is required.'],
            ]
        ),
    ]
)]
#[OA\Schema(
    schema: 'UnauthorizedError',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'Unauthenticated.'),
    ]
)]
#[OA\Schema(
    schema: 'NotFoundError',
    type: 'object',
    properties: [
        new OA\Property(property: 'message', type: 'string', example: 'Resource not found.'),
    ]
)]
class Schemas
{
}
```

Why reusable schemas matter:

- Controllers stay shorter.
- Response shapes stay consistent.
- Frontend developers can rely on stable data contracts.
- Generated clients can reuse the same model definitions.

## Step 5 - Make Sure L5-Swagger Scans The Right Paths

Open:

```text
config/l5-swagger.php
```

Find the annotations path section and make sure it scans `app`:

```php
'annotations' => [
    base_path('app'),
],
```

If your config already scans `app`, leave it alone.

Generate docs:

```bash
php artisan l5-swagger:generate
```

If the generator says no annotations were found, check:

- The file namespace is correct.
- The file is inside a scanned path.
- `use OpenApi\Attributes as OA;` is present.
- PHP version supports attributes.

## Step 6 - Document The List Endpoint

Open:

```text
app/Http/Controllers/Api/V1/UserProfileController.php
```

Add the import:

```php
use OpenApi\Attributes as OA;
```

Add this attribute above `index()`:

```php
#[OA\Get(
    path: '/api/v1/users',
    operationId: 'listUserProfiles',
    summary: 'List user profiles',
    description: 'Returns a paginated list of ABC Company user profiles.',
    tags: ['User Profiles'],
    security: [
        ['sanctum' => [], 'frontendToken' => []],
    ],
    parameters: [
        new OA\Parameter(
            name: 'page',
            in: 'query',
            required: false,
            schema: new OA\Schema(type: 'integer', example: 1)
        ),
        new OA\Parameter(
            name: 'search',
            in: 'query',
            required: false,
            schema: new OA\Schema(type: 'string', example: 'Aina')
        ),
        new OA\Parameter(
            name: 'active',
            in: 'query',
            required: false,
            schema: new OA\Schema(type: 'boolean', example: true)
        ),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'User profiles retrieved successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'User profiles retrieved successfully.'),
                    new OA\Property(
                        property: 'data',
                        type: 'array',
                        items: new OA\Items(ref: '#/components/schemas/UserProfile')
                    ),
                ]
            )
        ),
        new OA\Response(
            response: 401,
            description: 'Unauthorized',
            content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
        ),
    ]
)]
public function index(Request $request): AnonymousResourceCollection
{
    // Existing implementation.
}
```

Note:

If your actual response uses Laravel pagination, document the `data` object exactly as returned by your API. The example above is intentionally simple for teaching. For production, include pagination fields such as `current_page`, `links`, and `meta` if your API returns them.

## Step 7 - Document The Create Endpoint

Add this above `store()`:

```php
#[OA\Post(
    path: '/api/v1/users',
    operationId: 'createUserProfile',
    summary: 'Create user profile',
    description: 'Creates a new ABC Company user profile.',
    tags: ['User Profiles'],
    security: [
        ['sanctum' => [], 'frontendToken' => []],
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/StoreUserProfileRequest')
    ),
    responses: [
        new OA\Response(
            response: 201,
            description: 'User profile created successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'User profile created successfully.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/UserProfile'),
                ]
            )
        ),
        new OA\Response(
            response: 401,
            description: 'Unauthorized',
            content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
        ),
        new OA\Response(
            response: 422,
            description: 'Validation error',
            content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')
        ),
    ]
)]
public function store(StoreUserProfileRequest $request): JsonResponse
{
    // Existing implementation.
}
```

## Step 8 - Document The Show Endpoint

Add this above `show()`:

```php
#[OA\Get(
    path: '/api/v1/users/{userProfile}',
    operationId: 'showUserProfile',
    summary: 'Show user profile',
    description: 'Returns one user profile by ID.',
    tags: ['User Profiles'],
    security: [
        ['sanctum' => [], 'frontendToken' => []],
    ],
    parameters: [
        new OA\Parameter(
            name: 'userProfile',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', example: 1)
        ),
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'User profile retrieved successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'User profile retrieved successfully.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/UserProfile'),
                ]
            )
        ),
        new OA\Response(
            response: 401,
            description: 'Unauthorized',
            content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
        ),
        new OA\Response(
            response: 404,
            description: 'Resource not found',
            content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')
        ),
    ]
)]
public function show(UserProfile $userProfile): JsonResponse
{
    // Existing implementation.
}
```

## Step 9 - Document The Update Endpoint

Add this above `update()`:

```php
#[OA\Patch(
    path: '/api/v1/users/{userProfile}',
    operationId: 'updateUserProfile',
    summary: 'Update user profile',
    description: 'Updates one user profile by ID.',
    tags: ['User Profiles'],
    security: [
        ['sanctum' => [], 'frontendToken' => []],
    ],
    parameters: [
        new OA\Parameter(
            name: 'userProfile',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', example: 1)
        ),
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: '#/components/schemas/StoreUserProfileRequest')
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: 'User profile updated successfully',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'User profile updated successfully.'),
                    new OA\Property(property: 'data', ref: '#/components/schemas/UserProfile'),
                ]
            )
        ),
        new OA\Response(
            response: 401,
            description: 'Unauthorized',
            content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
        ),
        new OA\Response(
            response: 404,
            description: 'Resource not found',
            content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')
        ),
        new OA\Response(
            response: 422,
            description: 'Validation error',
            content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')
        ),
    ]
)]
public function update(UpdateUserProfileRequest $request, UserProfile $userProfile): JsonResponse
{
    // Existing implementation.
}
```

If your API also accepts `PUT`, add a separate `OA\Put` attribute or document `PATCH` as the official update method for the course.

## Step 10 - Document The Delete Endpoint

Add this above `destroy()`:

```php
#[OA\Delete(
    path: '/api/v1/users/{userProfile}',
    operationId: 'deleteUserProfile',
    summary: 'Delete user profile',
    description: 'Deletes one user profile by ID.',
    tags: ['User Profiles'],
    security: [
        ['sanctum' => [], 'frontendToken' => []],
    ],
    parameters: [
        new OA\Parameter(
            name: 'userProfile',
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', example: 1)
        ),
    ],
    responses: [
        new OA\Response(response: 204, description: 'User profile deleted successfully'),
        new OA\Response(
            response: 401,
            description: 'Unauthorized',
            content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
        ),
        new OA\Response(
            response: 404,
            description: 'Resource not found',
            content: new OA\JsonContent(ref: '#/components/schemas/NotFoundError')
        ),
    ]
)]
public function destroy(UserProfile $userProfile): JsonResponse
{
    // Existing implementation.
}
```

## Step 11 - Document The Login Endpoint

Open:

```text
app/Http/Controllers/Api/V1/AuthController.php
```

Add:

```php
use OpenApi\Attributes as OA;
```

Add this above `login()`:

```php
#[OA\Post(
    path: '/api/v1/auth/login',
    operationId: 'login',
    summary: 'Login',
    description: 'Authenticates a user and returns a Sanctum bearer token.',
    tags: ['Authentication'],
    security: [
        ['frontendToken' => []],
    ],
    requestBody: new OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            required: ['email', 'password'],
            properties: [
                new OA\Property(property: 'email', type: 'string', format: 'email', example: 'admin@example.com'),
                new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password'),
            ]
        )
    ),
    responses: [
        new OA\Response(
            response: 200,
            description: 'Login successful',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Login successful.'),
                    new OA\Property(
                        property: 'data',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                            new OA\Property(property: 'access_token', type: 'string', example: '1|example-token-value'),
                        ]
                    ),
                ]
            )
        ),
        new OA\Response(
            response: 401,
            description: 'Invalid frontend token',
            content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
        ),
        new OA\Response(
            response: 422,
            description: 'Invalid credentials or validation error',
            content: new OA\JsonContent(ref: '#/components/schemas/ValidationError')
        ),
    ]
)]
public function login(Request $request): JsonResponse
{
    // Existing implementation.
}
```

Login requires the frontend token, but not a bearer token. That is why this operation overrides security with only `frontendToken`.

## Step 12 - Document The Logout Endpoint

Add this above `logout()`:

```php
#[OA\Post(
    path: '/api/v1/auth/logout',
    operationId: 'logout',
    summary: 'Logout',
    description: 'Revokes the current Sanctum access token.',
    tags: ['Authentication'],
    security: [
        ['sanctum' => [], 'frontendToken' => []],
    ],
    responses: [
        new OA\Response(
            response: 200,
            description: 'Logout successful',
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Logout successful.'),
                ]
            )
        ),
        new OA\Response(
            response: 401,
            description: 'Unauthorized',
            content: new OA\JsonContent(ref: '#/components/schemas/UnauthorizedError')
        ),
    ]
)]
public function logout(Request $request): JsonResponse
{
    // Existing implementation.
}
```

## Step 13 - Generate Swagger Documentation

Run:

```bash
php artisan l5-swagger:generate
```

Open:

```text
http://127.0.0.1:8000/api/documentation
```

You should see:

- Authentication endpoints.
- User profile endpoints.
- Request body examples.
- Response examples.
- Authorize button.
- Security schemes for bearer token and `X-API-TOKEN`.

## Step 14 - Use Swagger UI Authorize

In Swagger UI:

1. Click `Authorize`.
2. For `frontendToken`, enter:

```text
abc-training-frontend-token
```

3. For `sanctum`, enter only the token value if Swagger UI already prefixes bearer tokens. If not, enter:

```text
Bearer 1|example-token-value
```

4. Run `GET /api/v1/users`.

If requests fail:

- Confirm `X-API-TOKEN` is sent.
- Confirm `Authorization` is sent.
- Confirm the token has not been revoked.
- Confirm the API server URL in Swagger matches the Laravel server URL.

## Step 15 - Add OpenAPI To The Training Workflow

Recommended workflow:

1. Write or update tests.
2. Implement the API change.
3. Update OpenAPI attributes.
4. Generate documentation.
5. Review Swagger UI manually.
6. Commit code and generated spec if your team tracks generated docs.

The API documentation should not be a one-time task. It should change whenever route behavior, payloads, status codes, or security changes.

## AI Prompt - Setup Swagger And Populate API Docs

Use this prompt when students want Claude Code or another coding assistant to install Swagger/OpenAPI support and populate the API documentation from the current Laravel API.

Reference example folder:

```text
https://github.com/habibtalib/laravel-api-tutorial/tree/master/examples/bonus-swagger-openapi
```

```text
Goal:
Set up Swagger/OpenAPI documentation for my Laravel API and populate the generated API docs.

Context:
This Laravel project is based on the Day 5 ABC Company Profile API. It has versioned routes under /api/v1, Sanctum bearer token authentication, a custom X-API-TOKEN frontend token middleware, user profile CRUD, pagination, search, active filtering, API resources, service classes, and JSON error responses.

Reference files and folder:
- examples/bonus-swagger-openapi
- examples/bonus-swagger-openapi/app/OpenApi/OpenApiSpec.php
- examples/bonus-swagger-openapi/app/OpenApi/Schemas.php
- examples/bonus-swagger-openapi/app/Http/Controllers/Api/V1/AuthController.php
- examples/bonus-swagger-openapi/app/Http/Controllers/Api/V1/UserProfileController.php
- examples/bonus-swagger-openapi/tests/Feature/OpenApiDocumentationTest.php
- examples/bonus-swagger-openapi/snippets/generate-docs.sh

Tasks:
1. Inspect my current Laravel routes, controllers, form requests, resources, service classes, and auth middleware before editing.
2. Install and publish L5-Swagger if it is not installed:
   - composer require darkaonline/l5-swagger
   - php artisan vendor:publish --provider "L5Swagger\\L5SwaggerServiceProvider"
3. Configure .env and config/l5-swagger.php so the app directory is scanned and local docs are generated to storage/api-docs/api-docs.json.
4. Add or merge OpenAPI metadata in app/OpenApi/OpenApiSpec.php:
   - API title and version
   - local server URL
   - bearer token security scheme for Sanctum
   - apiKey security scheme for X-API-TOKEN
5. Add or merge reusable schemas in app/OpenApi/Schemas.php:
   - UserProfile
   - paginated UserProfile list response
   - login request/response
   - validation error
   - unauthorized error
   - not found error
6. Populate OpenAPI attributes for these endpoints:
   - POST /api/v1/auth/login
   - POST /api/v1/auth/logout
   - GET /api/v1/users with page, search, and active query parameters
   - POST /api/v1/users
   - GET /api/v1/users/{userProfile}
   - PATCH /api/v1/users/{userProfile}
   - DELETE /api/v1/users/{userProfile}
7. Make protected endpoints document both required headers:
   - Authorization: Bearer <token>
   - X-API-TOKEN: abc-training-frontend-token
8. Generate API docs:
   - php artisan l5-swagger:generate
9. Verify:
   - storage/api-docs/api-docs.json exists
   - /api/documentation opens in the browser
   - the OpenAPI paths include every endpoint above
   - Swagger UI Authorize supports both bearer token and X-API-TOKEN
   - one protected endpoint can be called from Swagger UI after authorization
10. Add or update a feature test like OpenApiDocumentationTest if the project already has tests.

Constraints:
- Do not remove existing auth, frontend token, token abilities, validation, API resources, service layer, or JSON exception handling.
- Do not put real production tokens, secrets, or customer data in examples.
- Do not document response shapes from memory. Inspect the actual resources and controller responses.
- Keep generated docs local unless the project intentionally tracks storage/api-docs/api-docs.json.

Done criteria:
- L5-Swagger is installed and configured.
- app/OpenApi/OpenApiSpec.php and app/OpenApi/Schemas.php exist.
- Auth and user profile endpoints have OpenAPI attributes.
- Pagination, search, active filter, request bodies, responses, and error responses are documented.
- Both security layers are documented.
- php artisan l5-swagger:generate succeeds.
- /api/documentation shows populated API docs.
```

## Optional - Validate The Generated Spec In CI

You can add a simple test to confirm the OpenAPI JSON file exists.

Create:

```bash
php artisan make:test OpenApiDocumentationTest
```

Example:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class OpenApiDocumentationTest extends TestCase
{
    public function test_openapi_documentation_file_exists(): void
    {
        $path = storage_path('api-docs/api-docs.json');

        $this->assertFileExists($path);

        $json = json_decode(file_get_contents($path), true);

        $this->assertSame('3.0.3', $json['openapi']);
        $this->assertSame('ABC Company Profile API', $json['info']['title']);
        $this->assertArrayHasKey('/api/v1/users', $json['paths']);
    }
}
```

Before running this test, generate the docs:

```bash
php artisan l5-swagger:generate
php artisan test --filter=OpenApiDocumentationTest
```

In CI, run:

```bash
php artisan l5-swagger:generate
php artisan test
```

## Documentation Quality Checklist

Every endpoint should document:

- HTTP method.
- Full path.
- Summary.
- Request body if required.
- Query parameters.
- Path parameters.
- Success response.
- Validation error response.
- Unauthorized response.
- Not found response where relevant.
- Security requirements.
- Realistic examples.

## Security Checklist

Do not expose sensitive production details in Swagger docs.

Check:

- Do not include real production tokens.
- Do not include private customer data in examples.
- Protect `/api/documentation` in production if docs are private.
- Keep `L5_SWAGGER_GENERATE_ALWAYS=false` in production.
- Use HTTPS for hosted docs.
- Document both `Authorization` and `X-API-TOKEN` headers.

## Common Mistakes

- Documenting `/v1/users` instead of `/api/v1/users`.
- Forgetting the `X-API-TOKEN` security scheme.
- Documenting a response shape that does not match the real API.
- Forgetting to regenerate docs after changing attributes.
- Putting production secrets in examples.
- Leaving Swagger UI public for private APIs.
- Mixing OpenAPI 2.0 syntax with OpenAPI 3.x syntax.

## Class Lab

Students must:

1. Install L5-Swagger.
2. Create global OpenAPI metadata.
3. Add bearer token and frontend token security schemes.
4. Document login and logout.
5. Document all profile CRUD endpoints.
6. Generate documentation.
7. Open Swagger UI.
8. Authorize with both tokens.
9. Run one authenticated endpoint from Swagger UI.
10. Fix at least one response shape mismatch.

## Final Bonus Assignment

Submit:

- `app/OpenApi/OpenApiSpec.php`
- `app/OpenApi/Schemas.php`
- Updated `AuthController` OpenAPI attributes
- Updated `UserProfileController` OpenAPI attributes
- Generated Swagger UI screenshot or local URL confirmation
- Generated OpenAPI JSON or YAML file

Minimum required documented endpoints:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/{userProfile}`
- `PATCH /api/v1/users/{userProfile}`
- `DELETE /api/v1/users/{userProfile}`

## Bonus Marking Rubric

| Area | Marks |
| --- | ---: |
| L5-Swagger installed and generating docs | 15 |
| Global OpenAPI metadata is correct | 10 |
| Bearer and frontend token security schemes are correct | 15 |
| Auth endpoints are documented | 15 |
| Profile CRUD endpoints are documented | 25 |
| Request and response schemas match real API behavior | 15 |
| Swagger UI can call protected endpoints | 5 |
| Total | 100 |

## References

- L5-Swagger: https://github.com/DarkaOnLine/L5-Swagger
- L5-Swagger installation: https://github.com/DarkaOnLine/L5-Swagger/wiki/Installation-%26-Configuration
- swagger-php: https://zircote.github.io/swagger-php/
- swagger-php attributes: https://zircote.github.io/swagger-php/guide/attributes.html
- OpenAPI security: https://learn.openapis.org/specification/security.html
- Swagger authentication guide: https://swagger.io/docs/specification/v3_0/authentication/
- Swagger API keys guide: https://swagger.io/docs/specification/v3_0/authentication/api-keys/
