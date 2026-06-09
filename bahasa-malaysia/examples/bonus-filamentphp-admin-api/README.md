# Fail Contoh Bonus - FilamentPHP Admin Panel Untuk Data API

Folder ini mengandungi fail Laravel yang boleh disalin untuk modul bonus FilamentPHP.

Mulakan daripada projek Laravel Hari 5, kemudian install Filament dan salin atau merge fail ini ke dalam `abc-api`.

## Install Filament

```bash
composer require filament/filament:"^5.0"
php artisan filament:install --panels
php artisan make:filament-user
```

Jika menggunakan Windows PowerShell:

```bash
composer require filament/filament:"~5.0"
php artisan filament:install --panels
```

## Fail

| Fail contoh | Destinasi Laravel |
| --- | --- |
| `app/Filament/Resources/UserProfiles/*` | `app/Filament/Resources/UserProfiles/*` |
| `app/Filament/Resources/Projects/*` | `app/Filament/Resources/Projects/*` |
| `app/Models/User.php` | `app/Models/User.php` |
| `app/Models/Project.php` | `app/Models/Project.php` |
| `app/Policies/UserProfilePolicy.php` | `app/Policies/UserProfilePolicy.php` |
| `app/Policies/ProjectPolicy.php` | `app/Policies/ProjectPolicy.php` |
| `app/Providers/Filament/AdminPanelProvider.php` | `app/Providers/Filament/AdminPanelProvider.php` |
| `bootstrap/providers.php` | `bootstrap/providers.php` |

## Nota Merge Penting

Jika Filament sudah generate `AdminPanelProvider.php`, merge panel settings dan jangan overwrite secara buta.

Jika `bootstrap/providers.php` sudah mempunyai providers lain, tambah ini sahaja:

```php
App\Providers\Filament\AdminPanelProvider::class,
```

## Flow Test

1. Buka `/admin`.
2. Login sebagai Filament admin user.
3. Create user profile.
4. Create project yang linked kepada user profile.
5. Call API dan confirm rekod muncul.

```bash
TOKEN="PASTE_TOKEN_HERE" bash examples/bonus-filamentphp-admin-api/snippets/curl-api-after-filament.sh
```
