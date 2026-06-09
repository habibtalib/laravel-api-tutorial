# Frontend React Lengkap

React client Vite ini berfungsi dengan backend Laravel lengkap di:

```text
bahasa-malaysia/examples/complete-laravel-react-project/backend
```

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka:

```text
http://localhost:5173
```

## Login

```text
Email: admin@example.com
Password: password
```

Fail `.env.local` mesti mengandungi:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_FRONTEND_API_TOKEN=abc-training-frontend-token
```

Selepas login, client menyimpan `data.access_token`, `data.expires_at`, dan `data.abilities`. Jika token expired atau API memulangkan `401`, app akan clear local auth state dan minta user login semula. Jika token tiada CRUD ability, Laravel memulangkan `403` dan React UI memaparkan error tersebut.

## Apa Perlu Ditest

1. Login.
2. Load seeded profiles.
3. Search `aina`, `mei`, atau `kugan`.
4. View profile detail dan pastikan related projects dipaparkan.
5. Create profile.
6. Edit profile yang dicipta.
7. Delete profile yang dicipta.
8. Test token tanpa `profiles:create`, `profiles:update`, atau `profiles:delete` dan confirm blocked actions memulangkan `403`.
9. Logout dan confirm protected calls gagal.
