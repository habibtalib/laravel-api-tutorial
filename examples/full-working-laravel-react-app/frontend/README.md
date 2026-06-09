# Complete React Frontend

This Vite React client works with the complete Laravel backend in:

```text
examples/full-working-laravel-react-app/backend
```

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:5173
```

## Login

```text
Email: admin@example.com
Password: password
```

The `.env.local` file must contain:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_FRONTEND_API_TOKEN=abc-training-frontend-token
```

After login, the client stores `data.access_token`, `data.expires_at`, and `data.abilities`. If the token expires or the API returns `401`, the app clears local auth state and asks the user to login again. If the token is missing a CRUD ability, Laravel returns `403` and the React UI shows the error.

## What To Test

1. Login.
2. Load seeded profiles.
3. Search for `aina`, `mei`, or `kugan`.
4. View a profile detail and confirm related projects appear.
5. Create a profile.
6. Edit the created profile.
7. Delete the created profile.
8. Test a token without `profiles:create`, `profiles:update`, or `profiles:delete` and confirm blocked actions return `403`.
9. Logout and confirm protected calls fail.
