# Day 5 Example Files - Final API Structure

This folder contains the final copyable Laravel files for Day 5.

Start from the Day 4 Laravel project, then copy or merge these files into `abc-api`.

Day 5 is the final project structure, so this folder includes the main files from previous days plus the final service layer, route model binding, and API resources.

## Files

| Example file | Laravel destination |
| --- | --- |
| `routes/api.php` | `routes/api.php` |
| `bootstrap/app.php` | `bootstrap/app.php` |
| `app/Http/Controllers/Api/V1/AuthController.php` | `app/Http/Controllers/Api/V1/AuthController.php` |
| `app/Http/Controllers/Api/V1/UserProfileController.php` | `app/Http/Controllers/Api/V1/UserProfileController.php` |
| `app/Http/Middleware/VerifyFrontendToken.php` | `app/Http/Middleware/VerifyFrontendToken.php` |
| `app/Http/Requests/StoreUserProfileRequest.php` | `app/Http/Requests/StoreUserProfileRequest.php` |
| `app/Http/Requests/UpdateUserProfileRequest.php` | `app/Http/Requests/UpdateUserProfileRequest.php` |
| `app/Http/Resources/UserProfileResource.php` | `app/Http/Resources/UserProfileResource.php` |
| `app/Http/Resources/ProjectResource.php` | `app/Http/Resources/ProjectResource.php` |
| `app/Models/Project.php` | `app/Models/Project.php` |
| `app/Models/User.php` | `app/Models/User.php` |
| `app/Models/UserProfile.php` | `app/Models/UserProfile.php` |
| `app/Services/UserProfileService.php` | `app/Services/UserProfileService.php` |
| `database/migrations/*.php` | `database/migrations/*.php` |

## Artisan Commands

Run these if the files/classes do not exist yet:

```bash
php artisan make:controller Api/V1/AuthController
php artisan make:controller Api/V1/UserProfileController
php artisan make:middleware VerifyFrontendToken
php artisan make:request StoreUserProfileRequest
php artisan make:request UpdateUserProfileRequest
php artisan make:resource UserProfileResource
php artisan make:resource ProjectResource
php artisan make:model Project -m
```

## Final Test Flow

```bash
php artisan config:clear
php artisan migrate
php artisan serve
```

Create a test admin user if needed:

```bash
php artisan tinker
```

Paste:

```text
snippets/tinker-admin-user.php
```

Login:

```bash
bash examples/day-5-service-layer-final-project/snippets/curl-login.sh
```

Run final CRUD examples:

```bash
TOKEN="PASTE_TOKEN_HERE" bash examples/day-5-service-layer-final-project/snippets/curl-final-crud.sh
```

## React Client Integration

After the final API works with curl, use:

```text
examples/react-client-api-consumer
```

The React client should log in, store the returned Sanctum token for the local lab, list profiles, apply search/filter values, create a profile, and display API errors.
