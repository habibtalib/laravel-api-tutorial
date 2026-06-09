# Complete Laravel + React API Project Example

This example combines the final Laravel API backend and the React/Vite frontend into one copyable project package.

It includes Laravel API routes under `/api/v1`, Sanctum login/logout with token expiry and named abilities, `X-API-TOKEN` frontend middleware, protected user profile CRUD, search, pagination, API resources, a service layer, MySQL migrations, seed data, and a React CRUD client.

## Folder Layout

```text
examples/complete-laravel-react-project/
  backend/   Laravel files to copy into a fresh Laravel app
  frontend/  Complete Vite React client
```

## Seeded Login

```text
Email: admin@example.com
Password: password
Frontend token: abc-training-frontend-token
Token lifetime: 60 minutes by default
```

The backend seeder also creates five user profiles and related projects.

## Backend Setup

Create a fresh Laravel API project first:

```bash
composer create-project laravel/laravel abc-api
cd abc-api
php artisan install:api
```

Copy the files from `examples/complete-laravel-react-project/backend` into the matching paths in the Laravel project.

Merge the frontend token config from `backend/config/services.frontend.example.php` into `config/services.php`.

Update `.env` with the values from `backend/config/env.complete.example`, then run:

```bash
php artisan config:clear
php artisan migrate:fresh --seed
php artisan route:list --path=api/v1
php artisan serve
```

## Backend Smoke Test

Login:

```bash
bash examples/complete-laravel-react-project/backend/scripts/curl-login.sh
```

Copy `data.access_token` from the response, note `data.expires_at` and `data.abilities`, and run:

```bash
TOKEN="PASTE_TOKEN_HERE" bash examples/complete-laravel-react-project/backend/scripts/curl-crud.sh
```

## Frontend Setup

In another terminal:

```bash
cd examples/complete-laravel-react-project/frontend
npm install
cp .env.example .env.local
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

Login with the seeded admin user, then load profiles and test CRUD. The React client stores both the bearer token and `expires_at`, then clears local auth state when the token expires or Laravel returns `401`.

## API Contract

| Feature | Endpoint | Auth |
| --- | --- | --- |
| Login | `POST /api/v1/auth/login` | `X-API-TOKEN` |
| Logout | `POST /api/v1/auth/logout` | `X-API-TOKEN` + bearer token |
| List/search profiles | `GET /api/v1/users?search=aina` | `X-API-TOKEN` + bearer token + `profiles:read` |
| Create profile | `POST /api/v1/users` | `X-API-TOKEN` + bearer token + `profiles:create` |
| Show profile | `GET /api/v1/users/{id}` | `X-API-TOKEN` + bearer token + `profiles:read` |
| Update profile | `PUT /api/v1/users/{id}` | `X-API-TOKEN` + bearer token + `profiles:update` |
| Delete profile | `DELETE /api/v1/users/{id}` | `X-API-TOKEN` + bearer token + `profiles:delete` |

## Data Included

Seeded profiles:

- Aina Rahman
- Daniel Tan
- Mei Ling
- Kugan Raj
- Nur Iman

Each profile has at least one related project so the detail endpoint demonstrates nested resource data.
