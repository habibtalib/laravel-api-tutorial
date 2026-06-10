# Hari 4 - Performance, Caching, Query Optimization, Dan Exception Handling

## Matlamat Kelas

Peserta meningkatkan performance API dengan pagination, eager loading, caching, centralized JSON exception handling, dan React loading/search/error states.

## Rujukan PDF

Hari ini merujuk kepada PDF halaman 14-18, buku halaman 11-15. Kandungan utama: Redis caching, `Cache::remember`, eager loading, route/config cache, centralized exception handling, dan pagination.

## Pelan Kelas 6 Jam

| Masa | Fokus | Aktiviti |
| --- | --- | --- |
| 00:00-00:45 | Performance principle | Payload, query count, cache, dan error format |
| 00:45-01:30 | Pagination | Pastikan list endpoint tidak memulangkan semua data |
| 01:30-02:30 | Relationship | Tambah `Project` model untuk contoh eager loading |
| 02:30-03:30 | Cache | Tambah `Cache::remember` dan cache key |
| 03:30-04:20 | Exception handling | Setup JSON exception response Laravel |
| 04:20-05:05 | React API UX | Tambah search/filter, loading state, dan JSON error display |
| 05:05-06:00 | Lab | Test cache, 404 errors, route/config cache, dan React error states |

## Objektif Pembelajaran

Peserta boleh:

- menggunakan pagination untuk list endpoint.
- membina relationship Eloquent.
- menggunakan eager loading untuk elak N+1 queries.
- menambah cache pada endpoint list.
- clear cache selepas write operation.
- standardize JSON error response.
- mengekalkan frontend token, Sanctum auth, token expiry, dan ability checks Hari 3 semasa menambah performance Hari 4.
- menghantar search/filter query string daripada React.
- memaparkan pagination total, loading state, dan API errors dalam browser.

## Performance Principles

| Prinsip | Maksud |
| --- | --- |
| Paginate | Jangan pulangkan semua rekod sekaligus |
| Eager load | Kurangkan query berulang untuk relationship |
| Cache reads | Simpan response untuk query yang kerap |
| Invalidate writes | Clear cache selepas create, update, delete |
| Consistent errors | Semua error API perlu JSON yang boleh dijangka |

## Security Carry-Forward Daripada Hari 3

Hari 4 menambah performance dan exception handling selepas security Hari 3. Jangan salin semula `Route::apiResource('users', ...)` yang public atau hanya bearer-token tanpa ability.

Route state akhir Hari 4 masih:

- group `/api/v1` memerlukan `frontend.token` dan throttling.
- `POST /auth/login` memerlukan `X-API-TOKEN` tetapi belum memerlukan bearer token.
- `POST /auth/logout` memerlukan `auth:sanctum`.
- semua CRUD `/users` memerlukan `auth:sanctum` dan ability yang sepadan.

```php
Route::apiResource('users', UserProfileController::class)
    ->middlewareFor(['index', 'show'], 'abilities:profiles:read')
    ->middlewareFor('store', 'abilities:profiles:create')
    ->middlewareFor('update', 'abilities:profiles:update')
    ->middlewareFor('destroy', 'abilities:profiles:delete');
```

JSON exception handling Hari 4 perlu menambah konsistensi `404` dan `422` tanpa membuang response `403` missing ability daripada Hari 3.

## Konvensyen Code Snippet

Untuk snippet PHP dalam hari ini:

- `COPY WHOLE FILE` bermaksud gantikan fail sasaran dengan snippet tersebut.
- `PARTIAL PATCH` bermaksud salin bahagian yang ditunjukkan sahaja ke dalam fail sedia ada.
- Baris seperti `// ... existing code before` dan `// ... existing code after` ialah penanda context. Jangan padam code sebenar yang sudah ada di sekeliling bahagian itu.

## Diagram Architecture

```mermaid
flowchart LR
    React["React search/filter UI"] --> Headers["X-API-TOKEN + Bearer token"]
    Headers --> Security["frontend.token + auth:sanctum + abilities"]
    Security --> Route["GET /api/v1/users?page=1"]
    Client["API client"] --> Security
    Route --> Cache["Cache::remember"]
    Cache --> Query["UserProfile::with('projects')->paginate"]
    Query --> DB["Database"]
    Query --> JSON["Paginated JSON"]
    Writes["POST/PATCH/DELETE"] --> WriteSecurity["frontend.token + auth:sanctum + ability"]
    WriteSecurity --> Clear["Cache::forget / clear cache"]
    JSON --> React
```

## Step 1 - Confirm Pagination

Dalam `index()`, gunakan pagination. Jika projek anda sudah ada `UserProfileResource`, return resource collection secara terus supaya metadata pagination kekal pada top-level response:

Jika resource belum wujud, cipta dahulu:

```bash
php artisan make:resource UserProfileResource
```

Fail: `app/Http/Controllers/Api/V1/UserProfileController.php`

Jenis copy: `PARTIAL PATCH` - tambah import ini berdekatan `use` statements lain.

```php
// ... existing imports before
use App\Http\Resources\UserProfileResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
// ... existing imports after
```

Fail: `app/Http/Controllers/Api/V1/UserProfileController.php`

Jenis copy: `PARTIAL PATCH` - gantikan method `index()` sahaja.

```php
// ... existing controller class code before

public function index(): AnonymousResourceCollection
{
    $profiles = UserProfile::query()
        ->latest()
        ->paginate(15);

    return UserProfileResource::collection($profiles)
        ->additional([
            'message' => 'User profiles retrieved successfully.',
        ]);
}

// ... existing store/show/update/destroy methods after
```

Jangan wrap collection seperti ini:

```php
// JANGAN COPY: ini bentuk response resource yang salah kerana nested.
return response()->json([
    'message' => 'User profiles retrieved successfully.',
    'data' => UserProfileResource::collection($profiles),
]);
```

Cara itu akan menjadikan response bersarang di dalam `data` dan menyukarkan React membaca metadata pagination. Bentuk response list yang dijangka ialah `message`, `data`, `links`, dan `meta` pada top-level.

Test:

```bash
curl "http://127.0.0.1:8000/api/v1/users?page=1" \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

## Step 2 - Tambah Project Model

```bash
php artisan make:model Project -m
```

Fail: `database/migrations/YYYY_MM_DD_HHMMSS_create_projects_table.php`

Jenis copy: `PARTIAL PATCH` - gantikan kandungan closure `Schema::create('projects', ...)` dalam migration yang dijana.

```php
// ... existing migration up() method before
Schema::create('projects', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_profile_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('status')->default('active');
    $table->date('starts_at')->nullable();
    $table->timestamps();
});
// ... existing migration down() method after
```

Run:

```bash
php artisan migrate
```

## Step 3 - Define Relationship

Dalam `UserProfile`.

Fail: `app/Models/UserProfile.php`

Jenis copy: `PARTIAL PATCH` - tambah import dan method relationship sahaja.

```php
// ... existing imports before
use Illuminate\Database\Eloquent\Relations\HasMany;
// ... existing imports after

// ... existing model methods before
public function projects(): HasMany
{
    return $this->hasMany(Project::class);
}
// ... existing model methods after
```

Dalam `Project`.

Fail: `app/Models/Project.php`

Jenis copy: `PARTIAL PATCH` - tambah import dan method relationship sahaja.

```php
// ... existing imports before
use Illuminate\Database\Eloquent\Relations\BelongsTo;
// ... existing imports after

// ... existing model methods before
public function userProfile(): BelongsTo
{
    return $this->belongsTo(UserProfile::class);
}
// ... existing model methods after
```

### Fail Resource Untuk Response Pagination

Jika resource belum wujud, cipta dahulu:

```bash
php artisan make:resource ProjectResource
php artisan make:resource UserProfileResource
```

Fail: `app/Http/Resources/ProjectResource.php`

Jenis copy: `COPY WHOLE FILE`.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'status' => $this->status,
            'starts_at' => $this->starts_at?->toDateString(),
        ];
    }
}
```

Fail: `app/Http/Resources/UserProfileResource.php`

Jenis copy: `COPY WHOLE FILE`.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'id_card_number' => $this->id_card_number,
            'address' => $this->address,
            'is_active' => $this->is_active,
            'projects' => ProjectResource::collection($this->whenLoaded('projects')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
```

## Step 4 - Seed Sample Projects

```bash
php artisan tinker
```

```php
$profile = App\Models\UserProfile::first();

$profile->projects()->create([
    'name' => 'Company Website',
    'status' => 'active',
    'starts_at' => now()->toDateString(),
]);
```

## Step 5 - Avoid N+1 Dengan Eager Loading

Tanpa eager loading:

```php
UserProfile::query()->paginate(15);
```

Dengan eager loading:

```php
UserProfile::query()
    ->with('projects')
    ->latest()
    ->paginate(15);
```

Gunakan eager loading apabila response perlu memaparkan relationship.

## Step 6 - Tambah Cache Pada Index Endpoint

Fail: `app/Http/Controllers/Api/V1/UserProfileController.php`

Jenis copy: `PARTIAL PATCH` - tambah imports dan gantikan method `index()` sahaja.

```php
// ... existing imports before
use App\Http\Resources\UserProfileResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
// ... existing imports after

// ... existing controller class code before

public function index(): AnonymousResourceCollection
{
    $page = request()->integer('page', 1);
    $search = (string) request()->query('search', '');
    $cacheKey = "user_profiles.index.page.{$page}.search.".md5($search);

    $profiles = Cache::remember($cacheKey, now()->addMinutes(10), function () use ($search) {
        return UserProfile::query()
            ->with('projects')
            ->when($search !== '', function ($query) use ($search) {
                $query->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('id_card_number', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15);
    });

    return UserProfileResource::collection($profiles)
        ->additional([
            'message' => 'User profiles retrieved successfully.',
        ]);
}

// ... existing store/show/update/destroy methods after
```

Cache key mesti memasukkan page dan search supaya result filter tidak bercampur.

## Step 7 - Clear Cache Selepas Write

Untuk kelas, gunakan helper ringkas:

Fail: `app/Http/Controllers/Api/V1/UserProfileController.php`

Jenis copy: `PARTIAL PATCH` - tambah private helper dalam controller.

```php
// ... existing controller methods before
private function clearUserProfileCache(): void
{
    Cache::flush();
}
// ... existing controller methods after
```

Panggil selepas create, update, dan delete:

```php
// app/Http/Controllers/Api/V1/UserProfileController.php
// PARTIAL PATCH: panggil helper selepas create/update/delete berjaya.
// ... existing write method before
$profile = UserProfile::create($request->validated());
$this->clearUserProfileCache();
// ... existing write method response after
```

Nota production: elakkan `Cache::flush()` jika cache digunakan oleh banyak module. Guna cache tags atau key strategy yang lebih spesifik jika driver menyokong.

## Step 8 - Configure Redis Cache

Jika guna Redis:

```bash
composer require predis/predis
```

Fail: `.env`

Jenis copy: `PARTIAL PATCH` - tambah atau ubah key ini sahaja.

```dotenv
CACHE_STORE=redis
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

Clear config:

```bash
php artisan config:clear
```

## Step 9 - Production Optimization Commands

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Semasa development, clear jika perubahan tidak muncul:

```bash
php artisan optimize:clear
```

## Step 10 - JSON Exception Handling Laravel

Dalam `bootstrap/app.php`.

Fail: `bootstrap/app.php`

Jenis copy: `PARTIAL PATCH` - merge imports dan gantikan bahagian `withExceptions(...)` sahaja jika project sudah ada routing/middleware.

```php
// ... existing imports before
use App\Http\Middleware\VerifyFrontendToken;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;
// ... existing imports after

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ... existing middleware aliases before
        $middleware->alias([
            'abilities' => CheckAbilities::class,
            'ability' => CheckForAnyAbility::class,
            'frontend.token' => VerifyFrontendToken::class,
        ]);
        // ... existing middleware aliases after
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // ... existing exception configuration before
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });

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

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Resource not found.',
                ], 404);
            }
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Resource not found.',
                ], 404);
            }
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });
        // ... existing exception configuration after
    })->create();
```

## Step 11 - Test JSON Error

404:

```bash
curl http://127.0.0.1:8000/api/v1/users/999999 \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

Jangkaan:

```json
{
  "message": "Resource not found."
}
```

Validation:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/users \
  -H "Accept: application/json" \
  -H "X-API-TOKEN: abc-training-frontend-token" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"full_name": ""}'
```

Jangkaan:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "full_name": ["The full name field is required."]
  }
}
```

## Step 12 - Paparkan API State Dalam React

Gunakan:

```text
examples/react-client-api-consumer
```

Untuk Hari 4, fokus kepada UI behavior ini:

- paparkan `Loading...` semasa request sedang berjalan.
- hantar `search` dan `active` query string daripada filter controls.
- paparkan pagination total daripada metadata response API.
- paparkan error `401` jika token tiada atau expired.
- paparkan error `403` jika token tiada ability yang diperlukan.
- paparkan detail validation `422` apabila create gagal.

Contoh query call:

Fail: `examples/react-client-api-consumer/src/App.jsx`

Jenis copy: `PARTIAL PATCH` - gunakan dalam function yang load senarai profile.

```js
// ... existing list-loading function before
apiRequest('/users', {
  token,
  query: {
    page: 1,
    search,
    active,
  },
});
// ... existing list-loading function after
```

Point pengajaran:

Pilihan performance backend memberi kesan kepada UX frontend. Pagination, cache, dan JSON error yang konsisten menjadikan UI React lebih mudah dibina dan debug.

### Prompt Update React Client

Gunakan prompt ini jika peserta mahu Claude Code mengemaskini React client selepas perubahan backend Laravel Hari 4.

Fail sasaran:

- `examples/react-client-api-consumer/src/api.js`
- `examples/react-client-api-consumer/src/App.jsx`
- `examples/react-client-api-consumer/src/App.css`

Jenis copy: `AI PROMPT` - paste prompt ini ke Claude Code daripada root projek React.

```text
Goal:
Update my React client app so it works with the latest Day 4 Laravel API backend changes.

Context:
The Laravel API now has secured CRUD from Day 3 plus Day 4 pagination, eager-loaded projects, backend caching, cache clearing after writes, and centralized JSON exception handling. The list endpoint is GET /api/v1/users and returns a top-level response with message, data, links, and meta. The API still requires X-API-TOKEN and a Sanctum Bearer token with abilities.

Relevant frontend files:
- src/api.js
- src/App.jsx
- src/App.css

Backend response contract:
- GET /api/v1/users?page=1&search=abc returns:
  - message
  - data: array of user profiles
  - links
  - meta.total
  - meta.current_page
  - meta.last_page
  - meta.per_page
- 401 returns JSON with message "Unauthenticated."
- 403 returns JSON with a missing ability or forbidden message.
- 404 returns JSON with message "Resource not found."
- 422 returns JSON with message and errors object.

Tasks:
1. Inspect the current React API helper and profile list code before editing.
2. Keep existing login, logout, X-API-TOKEN, Bearer token, token expiry, and ability handling.
3. Update the list loader to send page and search query parameters.
4. Normalize the Laravel paginated response so records come from response.data and pagination comes from response.meta.
5. Render total records, current page, last page, previous button, and next button.
6. After create, update, or delete, reload the current list page so the UI reflects backend cache invalidation.
7. Parse JSON errors consistently:
   - 401: clear local token and show login-required message.
   - 403: show missing permission/ability message.
   - 404: show friendly not-found message.
   - 422: show validation field messages.
8. Add loading and disabled states while requests are running.
9. Do not fake cache behavior in React. Cache is handled by Laravel; React should refresh data after writes.

Done criteria:
- Search calls GET /api/v1/users with query string values.
- Pagination UI reads meta.total, meta.current_page, and meta.last_page.
- CRUD still works with the secured Laravel API.
- Validation, unauthorized, forbidden, and not-found errors display useful messages.
- No auth headers or frontend token behavior are removed.
```

## Prompt GSD Claude Code

Gunakan prompt ini jika peserta mahu Claude Code membantu tutorial Hari 4 untuk performance dan error handling.

```text
Goal:
Help me complete Day 4 of the Laravel API tutorial.

Context:
The API has CRUD and Day 3 security. Today I need pagination, Project relationship examples, eager loading, caching with safe cache keys, cache invalidation after writes, Laravel JSON exception handling, and React loading/search/filter/error states without removing frontend token, bearer token, token expiry, or Sanctum ability checks.

Relevant files:
- routes/api.php
- bootstrap/app.php
- app/Http/Controllers/Api/V1/UserProfileController.php
- app/Models/UserProfile.php
- app/Models/Project.php
- database/migrations
- config/cache.php
- examples/day-4-performance-exception-handling
- examples/react-client-api-consumer/src/api.js
- examples/react-client-api-consumer/src/App.jsx

Constraints:
- Inspect current controller/model/cache/error code before editing.
- Do not remove authentication, frontend token middleware, token expiry handling, or Sanctum ability middleware.
- Cache list responses with keys that include page/search/filter values.
- Clear stale cache after create, update, and delete.
- Do not expose raw exception messages in API JSON.
- Jika menggunakan `UserProfileResource`, return `UserProfileResource::collection($profiles)->additional(...)` supaya metadata pagination kekal pada top-level. Jangan letak resource collection di bawah `data`.

Done criteria:
- GET /api/v1/users is paginated and returns `message`, `data`, `links`, and `meta` at the top level.
- projects are eager-loaded without N+1 queries.
- repeated list calls can use cache.
- write operations clear stale list cache.
- 404 and validation failures return predictable JSON.
- missing ability returns JSON 403.
- React can show loading, search/filter results, and useful 401/403/422/404 messages.

Verification:
- Provide request examples and expected JSON responses for paginated list, search/filter list, 404, and validation error.
- Run or suggest php artisan optimize:clear after config/cache changes.
- If tests exist, run or suggest feature tests for list filters and JSON errors.
```

## Latihan Kelas

1. Tambah project kepada profile.
2. Test endpoint list dengan eager loading.
3. Call endpoint dua kali dan bincang cache.
4. Update profile dan pastikan cache clear.
5. Test 404 JSON response.
6. Test validation JSON response.
7. Test missing ability dan confirm JSON `403`.
8. Confirm React memaparkan loading, search/filter results, dan error messages.

## Kesilapan Biasa

- Cache key tidak mengambil kira `page` atau filter.
- Lupa clear cache selepas update/delete.
- Guna `Cache::flush()` dalam production tanpa kawalan.
- Return HTML error page untuk API.
- Tidak eager load relationship yang dipaparkan.
- Menggantikan protected route group Hari 3 dengan route Hari 4 yang public atau bearer-only.

## Soalan Review Hari 4

- Kenapa list endpoint perlu pagination?
- Apa itu N+1 query?
- Bila cache perlu di-clear?
- Kenapa JSON error response penting untuk API client?
- Apakah beza `route:cache` dan `config:cache`?
- Kenapa React client mendapat manfaat daripada bentuk JSON error yang konsisten?
- Kenapa Hari 4 mesti kekalkan ability middleware Hari 3 semasa menambah cache dan exception handling?

## Kerja Rumah

Tambah filter search:

```text
GET /api/v1/users?search=ali
```

Pastikan:

- query menggunakan `where`.
- cache key memasukkan nilai `search`.
- pagination masih berfungsi.
- React search input menghantar query string yang sama.
