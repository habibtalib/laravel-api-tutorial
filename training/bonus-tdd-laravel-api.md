# Bonus - Test-Driven Development For The Laravel API

## Bonus Goal

This bonus tutorial adds TDD to the ABC Company Profile API training. Students will learn to write Laravel feature tests before implementation, watch the tests fail, write the smallest code needed to pass, and then refactor.

Use this module after Day 5, or split it across Days 2-5.

## 6-Hour Bonus Class Plan

| Time | Topic | Activity |
| --- | --- | --- |
| 00:00-00:30 | TDD mindset | Explain red, green, refactor |
| 00:30-01:15 | Laravel testing setup | Configure MySQL test database and run the test suite |
| 01:15-02:00 | Factories | Create test data with factories |
| 02:00-02:15 | Break | Short break |
| 02:15-03:15 | API CRUD tests | Write failing feature tests for profile CRUD |
| 03:15-04:00 | Auth and middleware tests | Test Sanctum and frontend token behavior |
| 04:00-05:00 | TDD a new feature | Add `active` filter using red, green, refactor |
| 05:00-06:00 | Final test suite | Run all tests, fix failures, and review test quality |

## Learning Objectives

- Understand the TDD cycle.
- Create Laravel feature tests.
- Use `RefreshDatabase`.
- Use factories for test data.
- Test JSON APIs with `getJson`, `postJson`, `patchJson`, and `deleteJson`.
- Test Sanctum authenticated routes.
- Test validation, 401, 404, 201, 204, and 200 responses.
- Add a new API feature by writing the failing test first.

## TDD Rule

The workflow is:

1. Red: write one failing test.
2. Green: write the smallest code that passes.
3. Refactor: clean the code while keeping tests green.

Do not write implementation first for new behavior. If the test passes immediately, it did not prove the new behavior was missing.

## Step 1 - Run The Existing Test Suite

From the Laravel project root:

```bash
php artisan test
```

You can also run PHPUnit directly:

```bash
vendor/bin/phpunit
```

If your project uses Pest:

```bash
vendor/bin/pest
```

This tutorial uses PHPUnit-style examples. Pest can use the same Laravel request helpers and assertions.

## Step 2 - Configure The Testing Environment

Create `.env.testing`:

```env
APP_ENV=testing
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=abc_api_testing
DB_USERNAME=root
DB_PASSWORD=

CACHE_STORE=array
SESSION_DRIVER=array
QUEUE_CONNECTION=sync

FRONTEND_API_TOKEN=testing-frontend-token
```

Generate an app key for testing if needed:

```bash
php artisan key:generate --env=testing
```

Clear cached config:

```bash
php artisan config:clear
```

Create the dedicated test database:

```sql
CREATE DATABASE abc_api_testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Why this matters:

- Tests should not touch the local development database.
- `CACHE_STORE=array` keeps cache in memory during tests.
- A dedicated MySQL testing database lets Laravel run migrations and `RefreshDatabase` without damaging local development data.

## Step 3 - Create Factories

Factories make tests faster to write and easier to read.

Run:

```bash
php artisan make:factory UserProfileFactory --model=UserProfile
php artisan make:factory ProjectFactory --model=Project
```

Update `database/factories/UserProfileFactory.php`:

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class UserProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'id_card_number' => fake()->unique()->numerify('######-##-####'),
            'address' => fake()->address(),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }
}
```

Update `database/factories/ProjectFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_profile_id' => UserProfile::factory(),
            'name' => fake()->words(3, true),
            'status' => fake()->randomElement(['planning', 'active', 'completed']),
            'starts_at' => fake()->date(),
        ];
    }
}
```

Run the test suite:

```bash
php artisan test
```

At this point, tests may still pass because no new test has been added.

## Step 4 - Create The Feature Test File

Run:

```bash
php artisan make:test Api/V1/UserProfileApiTest
```

Open `tests/Feature/Api/V1/UserProfileApiTest.php`.

Use this base structure:

```php
<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserProfileApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.frontend.api_token' => 'testing-frontend-token',
        ]);
    }

    private function frontendHeaders(): array
    {
        return [
            'X-API-TOKEN' => 'testing-frontend-token',
        ];
    }

    private function authenticate(): User
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        return $user;
    }
}
```

Why `RefreshDatabase`?

It resets database state between tests so records from one test do not pollute another test.

Why `Sanctum::actingAs()`?

It lets the test call routes protected by `auth:sanctum` without manually creating and passing a bearer token.

## Step 5 - Red: Test Frontend Token Is Required

Add this test:

```php
public function test_frontend_token_is_required(): void
{
    $this->authenticate();

    $response = $this->getJson('/api/v1/users');

    $response
        ->assertUnauthorized()
        ->assertJson([
            'message' => 'Unauthorized: Invalid frontend API token.',
        ]);
}
```

Run only this test:

```bash
php artisan test --filter=frontend_token_is_required
```

Expected red behavior:

- If the middleware is not implemented, the test fails.
- If the message is different, the test fails.
- If routes are not protected by `frontend.token`, the test fails.

Green implementation should already exist if Day 3 is completed:

- `VerifyFrontendToken` middleware
- `frontend.token` alias in `bootstrap/app.php`
- `frontend.token` middleware on `v1` routes

Run again:

```bash
php artisan test --filter=frontend_token_is_required
```

Expected:

```text
PASS
```

## Step 6 - Red: Test Authenticated User Can Create A Profile

Add this test:

```php
public function test_authenticated_user_can_create_profile(): void
{
    $this->authenticate();

    $payload = [
        'full_name' => 'Aina Rahman',
        'phone' => '+60123456789',
        'id_card_number' => '900101-14-1234',
        'address' => 'Kuala Lumpur',
        'is_active' => true,
    ];

    $response = $this->postJson('/api/v1/users', $payload, $this->frontendHeaders());

    $response
        ->assertCreated()
        ->assertJsonPath('message', 'User profile created successfully.')
        ->assertJsonPath('data.full_name', 'Aina Rahman');

    $this->assertDatabaseHas('user_profiles', [
        'full_name' => 'Aina Rahman',
        'id_card_number' => '900101-14-1234',
    ]);
}
```

Run:

```bash
php artisan test --filter=authenticated_user_can_create_profile
```

Green implementation:

- `Route::apiResource('users', UserProfileController::class)`
- `store()` method in controller
- `StoreUserProfileRequest`
- `UserProfileService::create()`

## Step 7 - Red: Test Validation Errors

Add:

```php
public function test_create_profile_requires_required_fields(): void
{
    $this->authenticate();

    $response = $this->postJson('/api/v1/users', [], $this->frontendHeaders());

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'full_name',
            'phone',
            'id_card_number',
        ]);
}
```

Run:

```bash
php artisan test --filter=create_profile_requires_required_fields
```

Green implementation:

```php
public function rules(): array
{
    return [
        'full_name' => ['required', 'string', 'max:255'],
        'phone' => ['required', 'string', 'max:30'],
        'id_card_number' => ['required', 'string', 'max:50', 'unique:user_profiles,id_card_number'],
        'address' => ['nullable', 'string', 'max:1000'],
        'is_active' => ['sometimes', 'boolean'],
    ];
}
```

## Step 8 - Red: Test List Endpoint

Add:

```php
public function test_authenticated_user_can_list_profiles(): void
{
    $this->authenticate();

    UserProfile::factory()->count(3)->create();

    $response = $this->getJson('/api/v1/users', $this->frontendHeaders());

    $response
        ->assertOk()
        ->assertJsonPath('message', 'User profiles retrieved successfully.')
        ->assertJsonCount(3, 'data');
}
```

Run:

```bash
php artisan test --filter=authenticated_user_can_list_profiles
```

If the response uses Laravel pagination, the count path may need to be:

```php
->assertJsonCount(3, 'data.data');
```

Choose the assertion that matches your final response shape and keep it consistent.

## Step 9 - Red: Test Show Endpoint Uses Route Model Binding

Add:

```php
public function test_authenticated_user_can_show_profile(): void
{
    $this->authenticate();

    $profile = UserProfile::factory()->create([
        'full_name' => 'Daniel Tan',
    ]);

    $response = $this->getJson("/api/v1/users/{$profile->id}", $this->frontendHeaders());

    $response
        ->assertOk()
        ->assertJsonPath('message', 'User profile retrieved successfully.')
        ->assertJsonPath('data.full_name', 'Daniel Tan');
}
```

Run:

```bash
php artisan test --filter=authenticated_user_can_show_profile
```

Green implementation:

```php
public function show(UserProfile $userProfile): JsonResponse
{
    $userProfile->load('projects');

    return response()->json([
        'message' => 'User profile retrieved successfully.',
        'data' => new UserProfileResource($userProfile),
    ]);
}
```

## Step 10 - Red: Test Update Endpoint

Add:

```php
public function test_authenticated_user_can_update_profile(): void
{
    $this->authenticate();

    $profile = UserProfile::factory()->create([
        'phone' => '+60111111111',
    ]);

    $response = $this->patchJson(
        "/api/v1/users/{$profile->id}",
        ['phone' => '+60222222222'],
        $this->frontendHeaders()
    );

    $response
        ->assertOk()
        ->assertJsonPath('message', 'User profile updated successfully.')
        ->assertJsonPath('data.phone', '+60222222222');

    $this->assertDatabaseHas('user_profiles', [
        'id' => $profile->id,
        'phone' => '+60222222222',
    ]);
}
```

Run:

```bash
php artisan test --filter=authenticated_user_can_update_profile
```

## Step 11 - Red: Test Delete Endpoint

Add:

```php
public function test_authenticated_user_can_delete_profile(): void
{
    $this->authenticate();

    $profile = UserProfile::factory()->create();

    $response = $this->deleteJson("/api/v1/users/{$profile->id}", [], $this->frontendHeaders());

    $response->assertNoContent();

    $this->assertDatabaseMissing('user_profiles', [
        'id' => $profile->id,
    ]);
}
```

Run:

```bash
php artisan test --filter=authenticated_user_can_delete_profile
```

## Step 12 - Red: Test JSON 404 Response

Add:

```php
public function test_missing_profile_returns_json_404(): void
{
    $this->authenticate();

    $response = $this->getJson('/api/v1/users/999999', $this->frontendHeaders());

    $response
        ->assertNotFound()
        ->assertJson([
            'message' => 'Resource not found.',
        ]);
}
```

Run:

```bash
php artisan test --filter=missing_profile_returns_json_404
```

Green implementation should be in `bootstrap/app.php`:

```php
$exceptions->render(function (ModelNotFoundException $e, Request $request) {
    if ($request->is('api/*')) {
        return response()->json([
            'message' => 'Resource not found.',
        ], 404);
    }
});
```

## Step 13 - Test Login API

Create another test file:

```bash
php artisan make:test Api/V1/AuthApiTest
```

Update `tests/Feature/Api/V1/AuthApiTest.php`:

```php
<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.frontend.api_token' => 'testing-frontend-token',
        ]);
    }

    private function frontendHeaders(): array
    {
        return [
            'X-API-TOKEN' => 'testing-frontend-token',
        ];
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ], $this->frontendHeaders());

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Login successful.')
            ->assertJsonPath('data.token_type', 'Bearer')
            ->assertJsonMissingPath('data.user.password');

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_user_cannot_login_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ], $this->frontendHeaders());

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
```

Run:

```bash
php artisan test --filter=AuthApiTest
```

## Step 14 - TDD A New Feature: Active Profile Filter

Now add one new behavior using real TDD.

Required feature:

```text
GET /api/v1/users?active=1
```

Expected behavior:

- `active=1` returns only active profiles.
- `active=0` returns only inactive profiles.
- No `active` query returns all profiles.

### Red

Add this test to `UserProfileApiTest`:

```php
public function test_user_profiles_can_be_filtered_by_active_status(): void
{
    $this->authenticate();

    UserProfile::factory()->create([
        'full_name' => 'Active User',
        'is_active' => true,
    ]);

    UserProfile::factory()->inactive()->create([
        'full_name' => 'Inactive User',
    ]);

    $response = $this->getJson('/api/v1/users?active=1', $this->frontendHeaders());

    $response
        ->assertOk()
        ->assertJsonFragment([
            'full_name' => 'Active User',
        ])
        ->assertJsonMissing([
            'full_name' => 'Inactive User',
        ]);
}
```

Run:

```bash
php artisan test --filter=user_profiles_can_be_filtered_by_active_status
```

Expected:

```text
FAIL
```

If it passes immediately, the feature already exists or the test is not strict enough.

### Green

Update `app/Services/UserProfileService.php`:

```php
public function paginate(
    ?string $search = null,
    ?bool $active = null,
    int $perPage = 15,
    int $page = 1
): LengthAwarePaginator {
    $safeSearch = $search ?? '';
    $activeKey = is_null($active) ? 'all' : (int) $active;
    $cacheKey = "user_profiles.index.page.{$page}.per_page.{$perPage}.active.{$activeKey}.search.".md5($safeSearch);

    return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($safeSearch, $active, $perPage, $page) {
        return UserProfile::query()
            ->with('projects')
            ->when($safeSearch !== '', function ($query) use ($safeSearch) {
                $query->where('full_name', 'like', "%{$safeSearch}%")
                    ->orWhere('phone', 'like', "%{$safeSearch}%")
                    ->orWhere('id_card_number', 'like', "%{$safeSearch}%");
            })
            ->when(! is_null($active), function ($query) use ($active) {
                $query->where('is_active', $active);
            })
            ->latest()
            ->paginate($perPage, ['*'], 'page', $page);
    });
}
```

Update `app/Http/Controllers/Api/V1/UserProfileController.php`:

```php
public function index(Request $request): AnonymousResourceCollection
{
    $active = $request->has('active')
        ? $request->boolean('active')
        : null;

    $profiles = $this->userProfileService->paginate(
        search: $request->query('search'),
        active: $active,
        perPage: 15,
        page: $request->integer('page', 1),
    );

    return UserProfileResource::collection($profiles)
        ->additional([
            'message' => 'User profiles retrieved successfully.',
        ]);
}
```

Run:

```bash
php artisan test --filter=user_profiles_can_be_filtered_by_active_status
```

Expected:

```text
PASS
```

### Refactor

After the test passes, clean up repeated test setup by adding this helper to `UserProfileApiTest`:

```php
private function authenticatedHeaders(): array
{
    $this->authenticate();

    return $this->frontendHeaders();
}
```

Then update tests to use:

```php
$headers = $this->authenticatedHeaders();

$response = $this->getJson('/api/v1/users', $headers);
```

Run all tests:

```bash
php artisan test
```

## Step 15 - Optional TDD Test Matrix

Add these tests if time allows:

| Behavior | Test Name |
| --- | --- |
| Login requires frontend token | `test_login_requires_frontend_token` |
| Profile routes require authentication | `test_profiles_require_authentication` |
| Duplicate ID card is rejected | `test_duplicate_id_card_number_is_rejected` |
| Search returns matching profiles | `test_profiles_can_be_searched` |
| Project relation appears in show response | `test_profile_show_includes_projects` |
| Delete clears profile from database | `test_delete_removes_profile_from_database` |
| Logout revokes token | `test_logout_revokes_current_token` |

Example duplicate test:

```php
public function test_duplicate_id_card_number_is_rejected(): void
{
    $this->authenticate();

    UserProfile::factory()->create([
        'id_card_number' => '900101-14-1234',
    ]);

    $response = $this->postJson('/api/v1/users', [
        'full_name' => 'Duplicate User',
        'phone' => '+60123456789',
        'id_card_number' => '900101-14-1234',
    ], $this->frontendHeaders());

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['id_card_number']);
}
```

## Running Specific Tests

Run one class:

```bash
php artisan test tests/Feature/Api/V1/UserProfileApiTest.php
```

Run one test method:

```bash
php artisan test --filter=authenticated_user_can_create_profile
```

Run everything:

```bash
php artisan test
```

## What Good API Tests Check

Good tests check behavior, not private implementation.

Check these:

- HTTP status code.
- JSON response shape.
- Important JSON values.
- Validation errors.
- Database state.
- Authentication and authorization.
- Security middleware behavior.

Avoid these:

- Testing private methods.
- Mocking Eloquent for normal feature tests.
- Asserting every timestamp unless the timestamp matters.
- One huge test that covers every endpoint.
- Writing tests after implementation and calling it TDD.

## Final Bonus Assignment

Students must submit:

- `UserProfileApiTest`
- `AuthApiTest`
- At least 10 passing feature tests
- One new feature built with red, green, refactor
- Screenshot or terminal output of:

```bash
php artisan test
```

Minimum required passing tests:

1. Frontend token is required.
2. Authentication is required.
3. User can login.
4. Wrong password fails.
5. User can create profile.
6. Create validation fails for missing fields.
7. User can list profiles.
8. User can show profile.
9. User can update profile.
10. User can delete profile.
11. Missing profile returns JSON 404.
12. Active filter works.

## Bonus Marking Rubric

| Area | Marks |
| --- | ---: |
| Test environment works | 10 |
| Factories are correct | 10 |
| Auth and middleware tests are covered | 15 |
| CRUD feature tests are covered | 25 |
| Validation and error tests are covered | 15 |
| Active filter was built with TDD | 15 |
| Tests are readable and focused | 10 |
| Total | 100 |

## References

- Laravel testing: https://laravel.com/docs/12.x/testing
- Laravel HTTP tests: https://laravel.com/docs/12.x/http-tests
- Laravel database testing: https://laravel.com/docs/12.x/database-testing
- Laravel Sanctum testing and API tokens: https://laravel.com/docs/12.x/sanctum
