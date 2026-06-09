# Contoh React Client - Memanggil Laravel REST API

Folder ini mengandungi React/Vite client yang boleh disalin untuk latihan Laravel API 5 hari.

Client ini sengaja dibuat kecil. Ia menunjukkan konsep browser-side yang peserta perlukan:

- configure API base URL dengan Vite environment variables.
- faham bahawa list Hari 1 dan CRUD Hari 2 adalah public semasa lesson itu dibina.
- hantar header frontend `X-API-TOKEN` apabila middleware Hari 3 ditambah.
- login untuk menerima bearer token Laravel Sanctum, timestamp `expires_at`, dan token abilities pada Hari 3.
- call protected list, view, create, update, dan delete endpoints dengan ability yang betul selepas security Hari 3 ditambah.
- clear state auth expired apabila token sudah tamat tempoh atau Laravel memulangkan `401`, dan papar `403` apabila token tiada ability.
- list, search, view, create, update, dan delete user profiles.
- handle loading, `401`, `403`, `422`, dan error JSON umum.

## Kedudukan Dalam 5 Hari

| Hari | Fokus React client |
| --- | --- |
| Hari 1 | Create Vite app, configure `.env`, call endpoint API ringkas |
| Hari 2 | Bina list, detail, create, update, dan delete actions untuk REST CRUD |
| Hari 3 | Tambah login, bearer token expiry storage, protected API calls |
| Hari 4 | Tambah search/filter, pagination awareness, loading dan error states |
| Hari 5 | Gunakan final API contract dan terangkan architecture client-to-API penuh |

## Create React App Baru

Dari luar projek Laravel:

```bash
npm create vite@latest abc-api-client
cd abc-api-client
npm install
```

Apabila Vite bertanya:

```text
Framework: React
Variant: JavaScript
```

Salin fail daripada folder ini ke dalam React app:

| Fail contoh | Destinasi React |
| --- | --- |
| `package.json` | `package.json` |
| `vite.config.js` | `vite.config.js` |
| `index.html` | `index.html` |
| `.env.example` | `.env.local` |
| `src/main.jsx` | `src/main.jsx` |
| `src/App.jsx` | `src/App.jsx` |
| `src/api.js` | `src/api.js` |
| `src/App.css` | `src/App.css` |

Update `.env.local` jika Laravel API menggunakan URL atau token yang berbeza.

## Start Kedua-dua App

Laravel API:

```bash
php artisan serve
```

React client:

```bash
npm run dev
```

Buka URL React yang dipaparkan oleh Vite, biasanya:

```text
http://localhost:5173
```

## Nota Laravel CORS

React berjalan pada origin berbeza daripada Laravel, jadi pastikan Laravel membenarkan origin Vite semasa latihan local.

Untuk lab kelas, benarkan:

```text
http://localhost:5173
```

Pastikan CORS strict di production. Jangan gunakan unrestricted origins untuk private APIs.

## Flow Test

1. Start Laravel dan React.
2. Confirm frontend token dalam `.env.local`.
3. Login dengan:

```text
admin@example.com
password
```

4. Klik "Load profiles". Button hanya enabled apabila token ada `profiles:read`.
5. Search mengikut nama, telefon, atau no. kad pengenalan selepas endpoint search Hari 4 wujud.
6. Klik "Lihat" untuk call `GET /api/v1/users/{id}` dengan `profiles:read`.
7. Create profile daripada form dengan `profiles:create`.
8. Klik "Edit", update form, dan submit `PUT /api/v1/users/{id}` dengan `profiles:update`.
9. Klik "Padam" untuk call `DELETE /api/v1/users/{id}` dengan `profiles:delete` dan jangka `204 No Content`.
10. Set token lifetime yang pendek atau paksa expiry dalam Tinker, kemudian confirm client clear auth state selepas expiry.
11. Test read-only token dan confirm create, update, dan delete memulangkan `403`.
12. Logout dan confirm protected calls gagal.

## Liputan Endpoint

| Action React | Endpoint Laravel | Method |
| --- | --- | --- |
| Load profiles | `/api/v1/users?page=1&search=ali` | `GET` |
| View profile detail | `/api/v1/users/{id}` | `GET` |
| Create profile | `/api/v1/users` | `POST` |
| Update profile | `/api/v1/users/{id}` | `PUT` |
| Delete profile | `/api/v1/users/{id}` | `DELETE` |

Form profile mengikut field Laravel API: `full_name`, `id_card_number`, `phone`, `address`, dan `is_active`.

Selepas security Hari 3 ditambah, setiap endpoint dalam table ini memerlukan header frontend `X-API-TOKEN`, Sanctum bearer token, dan token ability yang sepadan.
Response login juga mengandungi `expires_at` dan `abilities`; client menyimpannya dalam `abc_api_token_expires_at` dan `abc_api_token_abilities`, kemudian clear saved bearer token apabila token sudah expired.

## Point Pengajaran Penting

- Browser client tidak call Eloquent atau Laravel services secara langsung.
- React hanya tahu HTTP contract: method, URL, headers, body, dan JSON response.
- Profile listing Hari 1 dan full CRUD Hari 2 sengaja public sebelum security Hari 3 ditambah.
- Contoh React terkini selari dengan API secured akhir, jadi ia memerlukan login dan token abilities untuk CRUD profile.
- `X-API-TOKEN` mengenal pasti frontend client selepas middleware Hari 3 ditambah.
- `Authorization: Bearer ...` mengenal pasti user yang login selepas Sanctum ditambah.
- `expires_at` memberitahu React bila bearer token tidak patut digunakan lagi.
- `abilities` memberitahu React control CRUD mana yang patut enabled; Laravel tetap enforce ability yang sama di backend.
- Jangan simpan production secrets dalam frontend code. Frontend token di sini ialah kawalan latihan, bukan pengganti user authentication.
