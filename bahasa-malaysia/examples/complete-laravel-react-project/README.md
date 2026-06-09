# Contoh Projek Lengkap Laravel + React API

Contoh ini menggabungkan backend Laravel API final dan frontend React/Vite dalam satu pakej yang boleh disalin.

Ia merangkumi route Laravel API di `/api/v1`, login/logout Sanctum dengan token expiry dan named abilities, middleware frontend `X-API-TOKEN`, CRUD user profile yang protected, search, pagination, API resources, service layer, migration MySQL, seed data, dan React CRUD client.

## Struktur Folder

```text
bahasa-malaysia/examples/complete-laravel-react-project/
  backend/   Fail Laravel untuk disalin ke projek Laravel baru
  frontend/  React client lengkap menggunakan Vite
```

## Login Seeded

```text
Email: admin@example.com
Password: password
Frontend token: abc-training-frontend-token
Token lifetime: 60 minit secara default
```

Seeder backend juga mencipta lima user profiles dan related projects.

## Setup Backend

Bina projek Laravel API baru dahulu:

```bash
composer create-project laravel/laravel abc-api
cd abc-api
php artisan install:api
```

Salin fail daripada `bahasa-malaysia/examples/complete-laravel-react-project/backend` ke path yang sama dalam projek Laravel.

Merge config frontend token daripada `backend/config/services.frontend.example.php` ke dalam `config/services.php`.

Update `.env` menggunakan nilai daripada `backend/config/env.complete.example`, kemudian run:

```bash
php artisan config:clear
php artisan migrate:fresh --seed
php artisan route:list --path=api/v1
php artisan serve
```

## Smoke Test Backend

Login:

```bash
bash bahasa-malaysia/examples/complete-laravel-react-project/backend/scripts/curl-login.sh
```

Copy `data.access_token` daripada response, semak `data.expires_at` dan `data.abilities`, kemudian run:

```bash
TOKEN="PASTE_TOKEN_HERE" bash bahasa-malaysia/examples/complete-laravel-react-project/backend/scripts/curl-crud.sh
```

## Setup Frontend

Dalam terminal lain:

```bash
cd bahasa-malaysia/examples/complete-laravel-react-project/frontend
npm install
cp .env.example .env.local
npm run dev
```

Buka URL Vite, biasanya:

```text
http://localhost:5173
```

Login menggunakan seeded admin user, kemudian load profiles dan test CRUD. React client menyimpan bearer token dan `expires_at`, kemudian clear local auth state apabila token expired atau Laravel memulangkan `401`.

## Kontrak API

| Feature | Endpoint | Auth |
| --- | --- | --- |
| Login | `POST /api/v1/auth/login` | `X-API-TOKEN` |
| Logout | `POST /api/v1/auth/logout` | `X-API-TOKEN` + bearer token |
| List/search profiles | `GET /api/v1/users?search=aina` | `X-API-TOKEN` + bearer token + `profiles:read` |
| Create profile | `POST /api/v1/users` | `X-API-TOKEN` + bearer token + `profiles:create` |
| Show profile | `GET /api/v1/users/{id}` | `X-API-TOKEN` + bearer token + `profiles:read` |
| Update profile | `PUT /api/v1/users/{id}` | `X-API-TOKEN` + bearer token + `profiles:update` |
| Delete profile | `DELETE /api/v1/users/{id}` | `X-API-TOKEN` + bearer token + `profiles:delete` |

## Data Yang Disediakan

Seeded profiles:

- Aina Rahman
- Daniel Tan
- Mei Ling
- Kugan Raj
- Nur Iman

Setiap profile mempunyai sekurang-kurangnya satu related project supaya detail endpoint menunjukkan nested resource data.
