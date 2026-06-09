# React Client Example - Calling The Laravel REST API

This folder contains a copyable React/Vite client for the 5-day Laravel API training.

The client is intentionally small. It demonstrates the browser-side concepts students need for the course:

- configure an API base URL with Vite environment variables.
- understand that Day 1 list and Day 2 CRUD were public while those lessons were being built.
- send the frontend `X-API-TOKEN` header when the Day 3 middleware is added.
- log in to receive a Laravel Sanctum bearer token, `expires_at` timestamp, and token abilities on Day 3.
- call protected list, view, create, update, and delete endpoints with the correct ability after Day 3 security is added.
- clear expired auth state when the token expiry passes or Laravel returns `401`, and show `403` when the token is missing an ability.
- list, search, view, create, update, and delete user profiles.
- handle loading, `401`, `403`, `422`, and general JSON errors.

## Where This Fits In The 5 Days

| Day | React client focus |
| --- | --- |
| Day 1 | Create Vite app, configure `.env`, call a simple API endpoint |
| Day 2 | Build list, detail, create, update, and delete actions for REST CRUD |
| Day 3 | Add login, bearer token expiry storage, protected API calls |
| Day 4 | Add search/filter, pagination awareness, loading and error states |
| Day 5 | Use the final API contract and explain full client-to-API architecture |

## Create A New React App

From outside the Laravel project:

```bash
npm create vite@latest abc-api-client
cd abc-api-client
npm install
```

When prompted by Vite:

```text
Framework: React
Variant: JavaScript
```

Copy the files from this folder into the React app:

| Example file | React destination |
| --- | --- |
| `package.json` | `package.json` |
| `vite.config.js` | `vite.config.js` |
| `index.html` | `index.html` |
| `.env.example` | `.env.local` |
| `src/main.jsx` | `src/main.jsx` |
| `src/App.jsx` | `src/App.jsx` |
| `src/api.js` | `src/api.js` |
| `src/App.css` | `src/App.css` |

Update `.env.local` if your Laravel API uses a different URL or token.

## Start Both Apps

Laravel API:

```bash
php artisan serve
```

React client:

```bash
npm run dev
```

Open the React URL shown by Vite, usually:

```text
http://localhost:5173
```

## Laravel CORS Note

Because React runs on a different origin from Laravel, make sure your Laravel app allows the Vite origin during local training.

For a class lab, allow:

```text
http://localhost:5173
```

Keep CORS strict in production. Do not use unrestricted origins for private APIs.

## Test Flow

1. Start Laravel and React.
2. Confirm the frontend token in `.env.local`.
3. Log in with:

```text
admin@example.com
password
```

4. Click "Load profiles". The button is enabled only when the token has `profiles:read`.
5. Search by name, phone, or ID card after the Day 4 search endpoint exists.
6. Click "View" to call `GET /api/v1/users/{id}` with `profiles:read`.
7. Create a profile from the form with `profiles:create`.
8. Click "Edit", update the form, and submit `PUT /api/v1/users/{id}` with `profiles:update`.
9. Click "Delete" to call `DELETE /api/v1/users/{id}` with `profiles:delete` and expect `204 No Content`.
10. Set a short token lifetime or force expiry in Tinker, then confirm the client clears auth state after expiry.
11. Test a read-only token and confirm create, update, and delete return `403`.
12. Logout and confirm protected calls fail.

## Endpoint Coverage

| React action | Laravel endpoint | Method |
| --- | --- | --- |
| Load profiles | `/api/v1/users?page=1&search=ali` | `GET` |
| View profile detail | `/api/v1/users/{id}` | `GET` |
| Create profile | `/api/v1/users` | `POST` |
| Update profile | `/api/v1/users/{id}` | `PUT` |
| Delete profile | `/api/v1/users/{id}` | `DELETE` |

The profile form follows the Laravel API fields: `full_name`, `id_card_number`, `phone`, `address`, and `is_active`.

After Day 3 security is added, every endpoint in this table requires the frontend `X-API-TOKEN` header, the Sanctum bearer token, and the matching token ability.
The login response also includes `expires_at` and `abilities`; the client stores them in `abc_api_token_expires_at` and `abc_api_token_abilities`, then clears the saved bearer token when it is expired.

## Important Teaching Points

- The browser client does not call Eloquent or Laravel services directly.
- React only knows the HTTP contract: method, URL, headers, body, and JSON response.
- Day 1 profile listing and full Day 2 CRUD were intentionally public before Day 3 security was added.
- The current React example is aligned with the final secured API, so it requires login and token abilities for profile CRUD.
- `X-API-TOKEN` identifies the frontend client after the Day 3 middleware is added.
- `Authorization: Bearer ...` identifies the logged-in user after Sanctum is added.
- `expires_at` tells React when the bearer token should stop being used.
- `abilities` tells React which CRUD controls should be enabled; Laravel still enforces the same abilities on the backend.
- Never store production secrets in frontend code. The frontend token here is a training control, not a replacement for user authentication.
