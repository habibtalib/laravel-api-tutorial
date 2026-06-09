# Fail Contoh Bonus - TDD Untuk Laravel API

Folder ini mengandungi fail Laravel yang boleh disalin untuk modul bonus TDD.

Mulakan daripada projek Laravel Hari 5, kemudian salin atau merge fail ini ke dalam `abc-api`.

## Fail

| Fail contoh | Destinasi Laravel |
| --- | --- |
| `config/env.testing.example` | `.env.testing` |
| `database/factories/UserProfileFactory.php` | `database/factories/UserProfileFactory.php` |
| `database/factories/ProjectFactory.php` | `database/factories/ProjectFactory.php` |
| `tests/Feature/Api/V1/UserProfileApiTest.php` | `tests/Feature/Api/V1/UserProfileApiTest.php` |
| `tests/Feature/Api/V1/AuthApiTest.php` | `tests/Feature/Api/V1/AuthApiTest.php` |
| `app/Services/UserProfileService.php` | `app/Services/UserProfileService.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `snippets/run-tests.sh` | Run manual dari terminal |

## Artisan Commands

Run command ini jika fail belum wujud:

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

ke:

```text
.env.testing
```

Kemudian run:

```bash
php artisan key:generate --env=testing
php artisan config:clear
```

## Run Tests

```bash
bash examples/bonus-tdd-laravel-api/snippets/run-tests.sh
```

Atau run terus:

```bash
php artisan test
php artisan test --filter=UserProfileApiTest
php artisan test --filter=AuthApiTest
```

## Apa Yang Bonus Ini Tambah

Fail test cover:

- frontend token middleware
- requirement Sanctum auth
- login berjaya
- wrong password failure
- create profile
- profile validation
- list profile
- show profile
- update profile
- delete profile
- JSON 404 response
- active profile filter

Service dan controller yang disalin termasuk green implementation untuk:

```text
GET /api/v1/users?active=1
GET /api/v1/users?active=0
```
