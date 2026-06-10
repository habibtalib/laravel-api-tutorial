# Hari 3 - API Security Dengan Sanctum, Token Expiry, Middleware, Dan Throttling

## Matlamat Kelas

Peserta melindungi API menggunakan Laravel Sanctum, expiring bearer token dengan named abilities, custom frontend token middleware, throttling, dan memanggil protected routes daripada React.

## Rujukan PDF

Hari ini merujuk kepada PDF halaman 11-13, buku halaman 8-10. Kandungan utama: `auth:sanctum`, middleware registration, throttling, frontend `X-API-TOKEN`, dan API security checklist. Implementasi login/logout lengkap, token expiry, Sanctum token abilities, dan flow ujian token ialah tambahan kursus.

## Pelan Kelas 6 Jam

| Masa | Fokus | Aktiviti |
| --- | --- | --- |
| 00:00-00:45 | Security layers | Terangkan auth token, frontend token, throttling |
| 00:45-01:30 | Sanctum | Confirm install dan prepare user model |
| 01:30-02:30 | Auth controller | Bina login endpoint yang mengeluarkan expiring token dan logout endpoint |
| 02:30-03:30 | Middleware | Bina `VerifyFrontendToken` |
| 03:30-04:30 | Route protection | Lindungi full CRUD user profiles dengan `frontend.token`, `auth:sanctum`, dan `throttle` |
| 04:30-05:00 | Token expiry dan abilities | Inspect `expires_at`, enforce Sanctum token abilities, dan test token read-only |
| 05:00-05:35 | React auth flow | Login dari React, simpan token dan `expires_at`, call protected routes |
| 05:35-06:00 | Lab | Test login, protected route, token expired, missing ability, logout, dan invalid-token JSON response dengan API client dan React |

## Objektif Pembelajaran

Peserta boleh:

- menggunakan Laravel Sanctum untuk token authentication.
- membina login/logout API.
- menetapkan bearer token expiry dan memulangkan `expires_at`.
- menyimpan named token abilities dalam column `personal_access_tokens.abilities`.
- secure full CRUD Hari 2: list, show, create, update, dan delete.
- meletakkan ability berbeza untuk read, create, update, dan delete profile.
- membina middleware untuk `X-API-TOKEN`.
- apply middleware pada route group.
- test request yang protected.
- memahami perbezaan frontend token dan bearer token.
- menyimpan Sanctum bearer token dalam React client semasa lab local.
- menghantar `X-API-TOKEN` dan `Authorization: Bearer ...` daripada React.

## Security Layers Untuk API Ini

| Layer | Tujuan |
| --- | --- |
| `X-API-TOKEN` | Pastikan request datang daripada frontend/client yang dibenarkan |
| `throttle:60,1` | Hadkan jumlah request setiap minit |
| `auth:sanctum` | Pastikan user authenticated dengan token yang masih valid dan belum expired |
| Token abilities | Pastikan token user mempunyai permission yang sesuai untuk action CRUD |
| Validation | Lindungi data input |
| HTTPS production | Lindungi token semasa transmission |

## Peraturan Security Route Hari 3

Hari 2 sengaja membenarkan CRUD public supaya peserta fokus pada REST dan validation. Pada akhir Hari 3, tiada route CRUD `/api/v1/users` yang boleh kekal public.

| Endpoint | State Hari 2 | Final state Hari 3 |
| --- | --- | --- |
| `GET /api/v1/users` | Public | `frontend.token` + `throttle:60,1` + `auth:sanctum` + `abilities:profiles:read` |
| `POST /api/v1/users` | Public | `frontend.token` + `throttle:60,1` + `auth:sanctum` + `abilities:profiles:create` |
| `GET /api/v1/users/{id}` | Public | `frontend.token` + `throttle:60,1` + `auth:sanctum` + `abilities:profiles:read` |
| `PUT/PATCH /api/v1/users/{id}` | Public | `frontend.token` + `throttle:60,1` + `auth:sanctum` + `abilities:profiles:update` |
| `DELETE /api/v1/users/{id}` | Public | `frontend.token` + `throttle:60,1` + `auth:sanctum` + `abilities:profiles:delete` |
| `POST /api/v1/auth/login` | Belum ada | `frontend.token` + login throttle, tanpa bearer token |
| `POST /api/v1/auth/logout` | Belum ada | `frontend.token` + `throttle:60,1` + `auth:sanctum` |

Final route file mesti ada satu sahaja `Route::apiResource('users', UserProfileController::class)`, dan ia mesti berada dalam protected group. Jika route public Hari 2 masih tertinggal di luar group itu, CRUD belum secured.

## Diagram Architecture

```mermaid
flowchart LR
    React["React login form"] --> FrontendToken["X-API-TOKEN middleware"]
    Client["API client"] --> FrontendToken
    FrontendToken --> Throttle["throttle:60,1"]
    Throttle --> RouteGroup["/api/v1 routes"]
    RouteGroup --> Login["POST /auth/login"]
    RouteGroup --> ProtectedCrud["Protected CRUD routes"]
    ProtectedCrud --> Sanctum["auth:sanctum"]
    Sanctum --> Expiry{"Token belum expired"}
    Expiry -- "Expired" --> Expired["401 Unauthenticated"]
    Expiry -- "Valid" --> Ability{"Token ada ability diperlukan"}
    Ability -- "Tiada" --> Forbidden["403 Invalid ability"]
    Ability -- "Ada" --> Controller["API Controller"]
    Controller --> DB["Database"]
    Controller --> JSON["JSON response"]
    JSON --> React
```

## Step 1 - Confirm Sanctum Installed

Jika Hari 1 menggunakan:

```bash
php artisan install:api
```

Sanctum biasanya sudah tersedia. Semak:

```bash
composer show laravel/sanctum
```

Pastikan migration dijalankan:

```bash
php artisan migrate
```

## Step 2 - Create Test User

Pastikan model `User` menggunakan `HasApiTokens`:

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

Create user:

```bash
php artisan tinker
```

```php
App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => bcrypt('password'),
]);
```

## Step 3 - Create Auth Controller

```bash
php artisan make:controller Api/V1/AuthController
```

```php
<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $expiresAt = now()->addMinutes((int) config('services.auth.token_expiry_minutes', 60));
        $abilities = [
            'profiles:read',
            'profiles:create',
            'profiles:update',
            'profiles:delete',
        ];
        $token = $user->createToken('training-token', $abilities, $expiresAt)->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'token_type' => 'Bearer',
                'access_token' => $token,
                'expires_at' => $expiresAt->toISOString(),
                'abilities' => $abilities,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }
}
```

## Step 4 - Add Auth Routes

```php
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('auth.login');

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout'])
            ->name('auth.logout');

        Route::apiResource('users', UserProfileController::class);
    });
});
```

Ini checkpoint bearer-token sebelum frontend token middleware ditambah. Teruskan sehingga Step 10 sebelum menganggap security Hari 3 siap.

Login route public kepada user, tetapi rate-limited. Logout dan semua CRUD user profile memerlukan Sanctum. Jangan tinggalkan `Route::apiResource('users', UserProfileController::class)` public daripada Hari 2 di luar protected group ini.

## Step 5 - Test Login

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

Jangkaan JSON response:

```json
{
  "message": "Login successful.",
  "data": {
    "token_type": "Bearer",
    "access_token": "1|example-token-value",
    "expires_at": "2026-06-09T09:30:00.000000Z",
    "abilities": [
      "profiles:read",
      "profiles:create",
      "profiles:update",
      "profiles:delete"
    ],
    "user": {
      "id": 1,
      "name": "Training Admin",
      "email": "admin@example.com"
    }
  }
}
```

Simpan token yang dipulangkan.

## Step 6 - Test Protected Route

Tanpa token:

```bash
curl http://127.0.0.1:8000/api/v1/users
```

Jangkaan JSON response:

```json
{
  "message": "Unauthenticated."
}
```

Dengan token:

```bash
curl http://127.0.0.1:8000/api/v1/users \
  -H "Authorization: Bearer 1|your-token"
```

Jangkaan JSON response:

```json
{
  "message": "User profiles retrieved successfully.",
  "data": [
    {
      "id": 1,
      "full_name": "Ali Ahmad"
    }
  ]
}
```

## Step 7 - Create Frontend Token Middleware

```bash
php artisan make:middleware VerifyFrontendToken
```

```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyFrontendToken
{
    public function handle(Request $request, Closure $next)
    {
        $expectedToken = config('services.frontend.api_token');

        if (! $expectedToken || $request->header('X-API-TOKEN') !== $expectedToken) {
            return response()->json([
                'message' => 'Unauthorized: Invalid frontend API token.',
            ], 401);
        }

        return $next($request);
    }
}
```

## Step 8 - Add Frontend Token Config

Dalam `.env`:

```dotenv
FRONTEND_API_TOKEN=abc-training-frontend-token
AUTH_TOKEN_EXPIRY_MINUTES=60
```

Dalam `config/services.php`:

```php
'frontend' => [
    'api_token' => env('FRONTEND_API_TOKEN'),
],

'auth' => [
    'token_expiry_minutes' => env('AUTH_TOKEN_EXPIRY_MINUTES', 60),
],
```

Clear config:

```bash
php artisan config:clear
```

## Step 9 - Register Middleware Alias

Dalam `bootstrap/app.php`:

```php
use App\Http\Middleware\VerifyFrontendToken;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
        'abilities' => CheckAbilities::class,
        'ability' => CheckForAnyAbility::class,
        'frontend.token' => VerifyFrontendToken::class,
    ]);
})

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (AuthorizationException $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        }
    });

    $exceptions->render(function (AccessDeniedHttpException $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 403);
        }
    });
})
```

## Step 10 - Apply Middleware

```php
Route::prefix('v1')
    ->name('api.v1.')
    ->middleware(['frontend.token', 'throttle:60,1'])
    ->group(function () {
        Route::post('/auth/login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1')
            ->name('auth.login');

        Route::middleware(['auth:sanctum'])->group(function () {
            Route::post('/auth/logout', [AuthController::class, 'logout'])
                ->name('auth.logout');

            // Final Hari 3: semua CRUD Hari 2 dilindungi.
            Route::apiResource('users', UserProfileController::class)
                ->middlewareFor(['index', 'show'], 'abilities:profiles:read')
                ->middlewareFor('store', 'abilities:profiles:create')
                ->middlewareFor('update', 'abilities:profiles:update')
                ->middlewareFor('destroy', 'abilities:profiles:delete');
        });
    });
```

Final route file ini menggantikan route public Hari 2. Tidak boleh ada lagi `Route::apiResource('users', UserProfileController::class)` public di mana-mana dalam `routes/api.php`.

## Step 11 - Test Dengan Dua Token

Login:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

Jangkaan JSON response:

```json
{
  "message": "Login successful.",
  "data": {
    "token_type": "Bearer",
    "access_token": "1|example-token-value",
    "expires_at": "2026-06-09T09:30:00.000000Z",
    "abilities": [
      "profiles:read",
      "profiles:create",
      "profiles:update",
      "profiles:delete"
    ]
  }
}
```

Protected route:

```bash
curl http://127.0.0.1:8000/api/v1/users \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer 1|your-token"
```

Jangkaan JSON response:

```json
{
  "message": "User profiles retrieved successfully.",
  "data": [
    {
      "id": 1,
      "full_name": "Ali Ahmad"
    }
  ]
}
```

Test write endpoint dengan kedua-dua headers:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/users \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer 1|your-token" \
  -d '{
    "full_name": "Day 3 Secure User",
    "id_card_number": "DAY3-001",
    "phone": "+60123334444",
    "address": "Kuala Lumpur"
  }'
```

Kemudian test show, update, dan delete dengan dua headers yang sama:

```bash
curl http://127.0.0.1:8000/api/v1/users/1 \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer 1|your-token"

curl -X PUT http://127.0.0.1:8000/api/v1/users/1 \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer 1|your-token" \
  -d '{
    "full_name": "Day 3 Secure User",
    "id_card_number": "DAY3-001",
    "phone": "+60129998888",
    "address": "Cyberjaya"
  }'

curl -i -X DELETE http://127.0.0.1:8000/api/v1/users/1 \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer 1|your-token"
```

Script penuh ada di:

```text
bahasa-malaysia/examples/day-3-api-security/snippets/curl-secured-crud.sh
```

## Step 12 - Test Token Expiry

Default lifetime token kelas ialah 60 minit:

```dotenv
AUTH_TOKEN_EXPIRY_MINUTES=60
```

Untuk lab cepat, paksa latest token jadi expired tanpa menunggu 60 minit. Buka Tinker:

```bash
php artisan tinker
```

Paste:

```php
$token = Laravel\Sanctum\PersonalAccessToken::latest('id')->first();

$token->forceFill([
    'expires_at' => now()->subYears(10),
])->save();
```

Ulang protected request menggunakan bearer token lama:

```bash
curl http://127.0.0.1:8000/api/v1/users \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer 1|expired-token"
```

Jangkaan JSON response:

```json
{
  "message": "Unauthenticated."
}
```

Point pengajaran:

Token expiry melindungi API apabila user lupa logout atau token tersalin daripada browser storage. Expiry tidak menggantikan logout. Logout masih revoke token semasa dengan segera.

## Step 13 - Test Logout

Logout:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/logout \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer 1|your-token"
```

Jangkaan JSON response:

```json
{
  "message": "Logout successful."
}
```

## Step 14 - Inspect Dan Test Column Token Abilities

Sanctum menyimpan permission token dalam column `personal_access_tokens.abilities`. Column ini ialah JSON text, jadi satu token boleh membawa senarai abilities kecil:

```json
[
  "profiles:read",
  "profiles:create",
  "profiles:update",
  "profiles:delete"
]
```

Shortcut `['*']` bermaksud token boleh melakukan semua abilities. Untuk training ini, gunakan named abilities supaya peserta nampak bagaimana setiap action CRUD diauthorize.

Inspect latest token dalam MySQL:

```sql
SELECT id, name, abilities, expires_at
FROM personal_access_tokens
ORDER BY id DESC
LIMIT 1;
```

Nilai `abilities` sepatutnya lebih kurang begini:

```json
["profiles:read","profiles:create","profiles:update","profiles:delete"]
```

Final route Hari 3 memetakan setiap API resource action kepada ability yang sesuai:

```php
Route::apiResource('users', UserProfileController::class)
    ->middlewareFor(['index', 'show'], 'abilities:profiles:read')
    ->middlewareFor('store', 'abilities:profiles:create')
    ->middlewareFor('update', 'abilities:profiles:update')
    ->middlewareFor('destroy', 'abilities:profiles:delete');
```

Cipta read-only token dalam Tinker:

```bash
php artisan tinker
```

```php
$user = App\Models\User::where('email', 'admin@example.com')->first();

$token = $user->createToken(
    'read-only-training-token',
    ['profiles:read'],
    now()->addMinutes(60)
)->plainTextToken;

$token;
```

Snippet yang sama ada di:

```text
bahasa-malaysia/examples/day-3-api-security/snippets/tinker-read-only-token.php
```

Test read action dengan read-only token:

```bash
curl http://127.0.0.1:8000/api/v1/users \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer PASTE_READ_ONLY_TOKEN_HERE"
```

Jangkaan status:

```text
200 OK
```

Test create action dengan token read-only yang sama:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/users \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer PASTE_READ_ONLY_TOKEN_HERE" \
  -d '{
    "full_name": "Read Only Should Fail",
    "id_card_number": "READONLY-001",
    "phone": "+60120000000",
    "address": "Kuala Lumpur"
  }'
```

Jangkaan status:

```text
403 Forbidden
```

Jangkaan JSON response:

```json
{
  "message": "Invalid ability provided."
}
```

Script test read-only ability ada di:

```text
bahasa-malaysia/examples/day-3-api-security/snippets/curl-read-only-ability-test.sh
```

Point pengajaran:

`auth:sanctum` menjawab "siapa user ini?" Token abilities menjawab "apa token ini boleh buat?" React tidak perlu faham semua ability untuk lab kelas ini, tetapi backend mesti enforce ability sebelum controller code dijalankan.

## Step 15 - Test Security Flow Yang Sama Dalam React

Gunakan:

```text
examples/react-client-api-consumer
```

Untuk Hari 3, fokus kepada:

```text
src/api.js
src/App.jsx
```

API helper sentiasa menghantar frontend token:

```js
'X-API-TOKEN': FRONTEND_API_TOKEN
```

Protected requests juga menghantar Sanctum token:

```js
Authorization: `Bearer ${token}`
```

Flow login React:

1. submit email dan password ke `POST /api/v1/auth/login`.
2. baca `data.access_token`, `data.expires_at`, dan optional `data.abilities` daripada JSON response; simpan token dan expiry dalam state serta `localStorage` untuk lab kelas.
3. call `GET /api/v1/users` dengan kedua-dua header.
4. call create, update, dan delete profile dengan kedua-dua header.
5. sebelum protected calls, bandingkan `expires_at` dengan masa semasa browser.
6. jika token expired atau Laravel pulangkan `401`, clear local storage dan minta user login semula.
7. call logout dan clear token serta expiry time.

Helper expiry React:

```js
const tokenExpired = (expiresAt) => expiresAt && Date.now() >= new Date(expiresAt).getTime();
```

Point pengajaran:

`localStorage` sesuai untuk demo kelas kecil, tetapi token storage production perlu keputusan security berdasarkan threat model app.

## Prompt Update Frontend React

Gunakan prompt ini apabila backend Laravel sudah dikemas kini dan frontend React perlu diselaraskan dengan API contract terbaru.

```text
Goal:
Update the React/Vite frontend to match the latest Laravel API backend.

Backend contract to inspect first:
- routes/api.php
- app/Http/Controllers/Api/V1/AuthController.php
- app/Http/Controllers/Api/V1/UserProfileController.php
- app/Http/Resources if API resources exist
- latest curl examples or route:list output if available

Current Laravel API behavior:
- Base URL: http://127.0.0.1:8000/api/v1 unless the local .env uses a different port.
- Login: POST /api/v1/auth/login requires X-API-TOKEN and returns data.token_type, data.access_token, data.expires_at, data.abilities, and data.user.
- Logout: POST /api/v1/auth/logout requires X-API-TOKEN and Authorization: Bearer <token>.
- User profile CRUD routes require X-API-TOKEN and Authorization: Bearer <token>.
- GET /users and GET /users/{id} require profiles:read.
- POST /users requires profiles:create.
- PUT/PATCH /users/{id} requires profiles:update.
- DELETE /users/{id} requires profiles:delete.
- Expired or missing bearer tokens return 401 JSON.
- A token missing the required ability returns 403 JSON with message "Invalid ability provided."
- Validation errors return 422 JSON with errors.

React files to inspect and update:
- package.json
- .env.example
- src/api.js
- src/App.jsx
- src/App.css if UI states need styling

Requirements:
- Keep VITE_API_BASE_URL and VITE_FRONTEND_API_TOKEN in environment variables.
- Keep request construction centralized in src/api.js.
- Send X-API-TOKEN on every API call when configured.
- Send Authorization: Bearer <token> only after login.
- Store access_token, expires_at, user, and optional abilities in React state.
- Store token and expires_at in localStorage only for this training lab.
- Before protected requests, check expires_at and clear auth state if expired.
- On 401, clear auth state and ask the user to login again.
- On 403, show the backend message and do not retry automatically.
- On 422, display validation errors near the form.
- Support login, logout, list, search, show/detail, create, update, and delete.
- Do not enforce security only in React. React may hide buttons based on abilities, but Laravel remains the source of truth.
- Do not change backend files unless you first explain the mismatch and ask for approval.

Done criteria:
- npm install works if dependencies changed.
- npm run build passes.
- Browser flow works: login, list, show, create, update, delete, logout.
- Expired token or 401 clears local auth state.
- 403 missing ability is displayed clearly.
- The final response summarizes changed files, env values needed, and manual browser test steps.
```

## Prompt GSD Claude Code

Gunakan prompt ini jika peserta mahu Claude Code membantu tutorial Hari 3 untuk security.

```text
Goal:
Help me complete Day 3 of the Laravel API tutorial.

Context:
The API already has public user profile CRUD from Day 2. Today I need Laravel Sanctum login/logout, expiring bearer tokens with expires_at in the login response, named Sanctum token abilities stored in personal_access_tokens.abilities, protected full CRUD routes with ability middleware, frontend X-API-TOKEN middleware, throttling, expected security JSON responses, and the same login/list/show/create/update/delete/logout flow in React.

Relevant files:
- routes/api.php
- bootstrap/app.php
- app/Http/Controllers/Api/V1/AuthController.php
- app/Http/Middleware/VerifyFrontendToken.php
- app/Models/User.php
- config/services.php
- config/sanctum.php if relevant
- .env.example or local training env docs
- bahasa-malaysia/examples/day-3-api-security
- examples/react-client-api-consumer/src/api.js
- examples/react-client-api-consumer/src/App.jsx

Constraints:
- Inspect security-related files before editing.
- Do not read or print .env secrets.
- Read frontend token through config, not env() inside runtime code.
- Do not put auth:sanctum on the login route.
- Configure token expiry through config, not hardcoded controller magic numbers.
- Issue tokens with named abilities: profiles:read, profiles:create, profiles:update, and profiles:delete.
- Register Sanctum ability middleware aliases in bootstrap/app.php if they are not already registered.
- Move the Day 2 users apiResource into the protected Day 3 route group.
- Do not leave or duplicate a public users apiResource outside the protected group.
- Keep all profile CRUD routes behind frontend token, bearer token, and the correct ability checks.
- Do not weaken existing validation or route versioning.

Done criteria:
- POST /api/v1/auth/login returns a Sanctum bearer token, an expires_at timestamp, and the token abilities used in the lab.
- Expired bearer tokens reject protected routes with JSON 401.
- GET, POST, GET by ID, PUT/PATCH, and DELETE /api/v1/users reject requests without Authorization: Bearer token.
- A read-only token with profiles:read can list/show profiles but cannot create, update, or delete profiles.
- Write requests with a token missing the required ability return JSON 403.
- requests without X-API-TOKEN return JSON 401.
- throttling is applied to login and protected API routes.
- React can login, store token plus expiry for the lab, call protected list/show/create/update/delete routes, clear expired auth state, and logout.

Verification:
- Provide request examples and expected JSON responses for login, missing frontend token, missing bearer token, expired bearer token, missing ability, protected list, protected create, protected update, protected delete, and logout.
- Show how to inspect the personal_access_tokens abilities column in MySQL.
- Run or suggest php artisan route:list --path=api.
- Confirm there is no public Day 2 users apiResource left in routes/api.php.
- If tests exist, run or suggest auth and middleware tests.
```

## Security Checklist

- Jangan hard-code token production dalam source code.
- Simpan secret dalam `.env`.
- Gunakan HTTPS di production.
- Gunakan token expiry atau rotation policy.
- Pulangkan `expires_at` supaya client boleh clear token sebelum request gagal.
- Gunakan named Sanctum token abilities berbanding `['*']` apabila route perlukan permission berbeza.
- Jangan expose token dalam log.
- Rate limit endpoint penting.
- Pastikan `APP_DEBUG=false` di production.

## Latihan Kelas

1. Login tanpa `X-API-TOKEN` dan lihat status `401`.
2. Login dengan token frontend yang betul.
3. Call protected route tanpa bearer token.
4. Call protected route dengan kedua-dua token.
5. Create, view, update, dan delete `/api/v1/users/{id}` dengan kedua-dua token.
6. Cuba satu CRUD write tanpa bearer token dan pastikan `401`.
7. Paksa latest token expired dan pastikan bearer token lama pulangkan `401`.
8. Cipta read-only token dan pastikan list berjaya tetapi create memulangkan `403`.
9. Login semula dengan token baru yang ada full abilities.
10. Ulang login, list, create, update, delete, expiry handling, dan logout daripada React.
11. Logout dan cuba guna token lama.

## Kesilapan Biasa

- Lupa `HasApiTokens` pada model `User`.
- Lupa migrate table Sanctum.
- Salah nama header `X-API-TOKEN`.
- Lupa `php artisan config:clear` selepas edit `.env`.
- Overwrite `bootstrap/app.php` tanpa merge perubahan sedia ada.
- Tertinggal route public Hari 2 `Route::apiResource('users', ...)` dalam `routes/api.php`.
- Test list sahaja dan lupa create, update, delete juga mesti secured.
- Ubah `AUTH_TOKEN_EXPIRY_MINUTES` tetapi lupa `php artisan config:clear`.
- Cipta semua token dengan `['*']` dan tidak pernah test route-specific abilities.
- Tambah ability middleware sebelum `auth:sanctum`, lalu dapat debugging unauthenticated request yang mengelirukan.
- Simpan token expired dalam React local storage dan terus menghantar request yang gagal.

## Soalan Review Hari 3

- Apakah beza `X-API-TOKEN` dan bearer token?
- Kenapa login route masih perlukan frontend token?
- Apa fungsi `throttle:60,1`?
- Bagaimana Sanctum menyimpan token?
- Apa risiko jika `APP_DEBUG=true` di production?
- Apakah dua header yang React perlukan untuk protected routes?
- Apa yang React perlu buat apabila `expires_at` sudah lepas?
- Apa yang disimpan dalam column `personal_access_tokens.abilities`?
- Kenapa `POST /api/v1/users` patut memerlukan ability berbeza daripada `GET /api/v1/users`?

## Kerja Rumah

Tambah endpoint:

```text
GET /api/v1/auth/me
```

Endpoint perlu memulangkan maklumat user authenticated dan hanya boleh diakses dengan kedua-dua token.

Letakkan endpoint ini dalam route group Hari 3 yang sama, iaitu group yang sudah mempunyai `frontend.token` dan throttling. Endpoint ini masih perlu berada di bawah `auth:sanctum`.

Kemudian tambah panel kecil dalam React yang call endpoint ini dan memaparkan nama serta email user yang login.
