# Bonus Example Files - TDD For The Laravel API

This folder contains copyable Laravel files for the TDD bonus module.

Start from the Day 5 Laravel project, then copy or merge these files into `abc-api`.

## Files

| Example file | Laravel destination |
| --- | --- |
| `config/env.testing.example` | `.env.testing` |
| `database/factories/UserProfileFactory.php` | `database/factories/UserProfileFactory.php` |
| `database/factories/ProjectFactory.php` | `database/factories/ProjectFactory.php` |
| `tests/Feature/Api/V1/UserProfileApiTest.php` | `tests/Feature/Api/V1/UserProfileApiTest.php` |
| `tests/Feature/Api/V1/AuthApiTest.php` | `tests/Feature/Api/V1/AuthApiTest.php` |
| `app/Services/UserProfileService.php` | `app/Services/UserProfileService.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `snippets/run-tests.sh` | Run manually from terminal |

## Artisan Commands

Run these if the files do not exist yet:

```bash
php artisan make:factory UserProfileFactory --model=UserProfile
php artisan make:factory ProjectFactory --model=Project
php artisan make:test Api/V1/UserProfileApiTest
php artisan make:test Api/V1/AuthApiTest
```

## Testing Setup

Copy:

```text
config/env.testing.example
```

to:

```text
.env.testing
```

Then run:

```bash
php artisan key:generate --env=testing
php artisan config:clear
```

## Run Tests

```bash
bash examples/bonus-tdd-laravel-api/snippets/run-tests.sh
```

Or run directly:

```bash
php artisan test
php artisan test --filter=UserProfileApiTest
php artisan test --filter=AuthApiTest
```

## What This Bonus Adds

The test files cover:

- frontend token middleware
- Sanctum auth requirement
- login success
- wrong password failure
- profile create
- profile validation
- profile list
- profile show
- profile update
- profile delete
- JSON 404 response
- active profile filter

The copied service and controller include the green implementation for:

```text
GET /api/v1/users?active=1
GET /api/v1/users?active=0
```
