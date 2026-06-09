# Bonus Example Files - FilamentPHP Admin Panel For API Data

This folder contains copyable Laravel files for the FilamentPHP bonus module.

Start from the Day 5 Laravel project, then install Filament and copy or merge these files into `abc-api`.

## Install Filament

```bash
composer require filament/filament:"^5.0"
php artisan filament:install --panels
php artisan make:filament-user
```

If you use Windows PowerShell:

```bash
composer require filament/filament:"~5.0"
php artisan filament:install --panels
```

## Files

| Example file | Laravel destination |
| --- | --- |
| `app/Filament/Resources/UserProfiles/*` | `app/Filament/Resources/UserProfiles/*` |
| `app/Filament/Resources/Projects/*` | `app/Filament/Resources/Projects/*` |
| `app/Models/User.php` | `app/Models/User.php` |
| `app/Models/Project.php` | `app/Models/Project.php` |
| `app/Policies/UserProfilePolicy.php` | `app/Policies/UserProfilePolicy.php` |
| `app/Policies/ProjectPolicy.php` | `app/Policies/ProjectPolicy.php` |
| `app/Providers/Filament/AdminPanelProvider.php` | `app/Providers/Filament/AdminPanelProvider.php` |
| `bootstrap/providers.php` | `bootstrap/providers.php` |

## Important Merge Notes

If Filament already generated `AdminPanelProvider.php`, merge the panel settings instead of blindly overwriting the file.

If your `bootstrap/providers.php` already has providers, add only:

```php
App\Providers\Filament\AdminPanelProvider::class,
```

## Test Flow

1. Open `/admin`.
2. Log in as the Filament admin user.
3. Create a user profile.
4. Create a project linked to the user profile.
5. Call the API and confirm the records appear.

```bash
TOKEN="PASTE_TOKEN_HERE" bash examples/bonus-filamentphp-admin-api/snippets/curl-api-after-filament.sh
```
