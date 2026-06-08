# React Client Example - Calling The Laravel REST API

This folder contains a copyable React/Vite client for the 5-day Laravel API training.

The client is intentionally small. It demonstrates the browser-side concepts students need for the course:

- configure an API base URL with Vite environment variables.
- send the frontend `X-API-TOKEN` header.
- log in to receive a Laravel Sanctum bearer token.
- call protected REST endpoints.
- list, search, filter, and create user profiles.
- handle loading, `401`, `422`, and general JSON errors.

## Where This Fits In The 5 Days

| Day | React client focus |
| --- | --- |
| Day 1 | Create Vite app, configure `.env`, call a simple API endpoint |
| Day 2 | Build list and create form for REST CRUD |
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
2. Confirm the frontend token in `.env.local`.
3. Log in with:

```text
admin@example.com
password
```

4. Click "Load profiles".
5. Create a profile from the form.
6. Search and filter active records.
7. Logout and confirm protected calls fail.

## Important Teaching Points

- The browser client does not call Eloquent or Laravel services directly.
- React only knows the HTTP contract: method, URL, headers, body, and JSON response.
- `X-API-TOKEN` identifies the frontend client.
- `Authorization: Bearer ...` identifies the logged-in user.
- Never store production secrets in frontend code. The frontend token here is a training control, not a replacement for user authentication.
