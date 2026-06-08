# React Client Example - Calling The Laravel REST API

This folder contains a copyable React/Vite client for the 5-day Laravel API training.

The client is intentionally small. It demonstrates the browser-side concepts students need for the course:

- configure an API base URL with Vite environment variables.
- call the public profile list before authentication on Day 1.
- run full Day 2 CRUD before authentication.
- send the frontend `X-API-TOKEN` header when the Day 3 middleware is added.
- log in to receive a Laravel Sanctum bearer token on Day 3.
- call protected REST endpoints after Day 3 security is added.
- list, search, view, create, update, and delete user profiles.
- handle loading, `401`, `422`, and general JSON errors.

## Where This Fits In The 5 Days

| Day | React client focus |
| --- | --- |
| Day 1 | Create Vite app, configure `.env`, call a simple API endpoint |
| Day 2 | Build list, detail, create, update, and delete actions for REST CRUD |
| Day 3 | Add login, bearer token storage, protected API calls |
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
2. Click "Load profiles". Day 1 should load profiles before login.
3. Search by name, phone, or ID card after the Day 4 search endpoint exists.
4. Click "View" to call `GET /api/v1/users/{id}` after Day 2 CRUD exists.
5. Create a profile from the form after the Day 2 CRUD endpoint exists.
6. Click "Edit", update the form, and submit `PUT /api/v1/users/{id}`.
7. Click "Delete" to call `DELETE /api/v1/users/{id}` and expect `204 No Content`.
8. Do not log in for Day 2 CRUD. Login is only needed after Day 3 security is added.
9. After adding Day 3 security, confirm the frontend token in `.env.local`.
10. Log in with:

```text
admin@example.com
password
```

11. Click "Load profiles" again.
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

## Important Teaching Points

- The browser client does not call Eloquent or Laravel services directly.
- React only knows the HTTP contract: method, URL, headers, body, and JSON response.
- Day 1 profile listing and full Day 2 CRUD do not require login.
- `X-API-TOKEN` identifies the frontend client after the Day 3 middleware is added.
- `Authorization: Bearer ...` identifies the logged-in user after Sanctum is added.
- Never store production secrets in frontend code. The frontend token here is a training control, not a replacement for user authentication.
