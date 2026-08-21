# Food Delivery System

## Live URLs (add yours here)

- **Customer Web App (Frontend)**: [https://tekina.sakibb.com](https://tekina.sakibb.com)
- **Admin Dashboard**: [https://tekina-dashboard.sakibb.com](https://tekina-dashboard.sakibb.com)

---

## What is this project?

A full-stack **food delivery platform** with:

- **Backend API** (`backend`): Express + TypeScript + PostgreSQL (Drizzle ORM). Handles auth, restaurants, menus, orders, riders, addresses, coupons, support, zones, etc.
- **Customer Web App** (`frontend`): Next.js app for customers.
- **Admin Dashboard** (`dashboard`): Vite + React admin panel for managing the system.
- **Rider Mobile App** (`rider-mobile-app`): Expo / React Native app for delivery riders (maps + live location).

## Repo structure

```text
backend/           # Express API (TypeScript) + Postgres (Drizzle)
frontend/          # Next.js customer web app
dashboard/         # Vite + React admin dashboard
rider-mobile-app/  # Expo (React Native) rider app
```

## Local development (run everything)

### Prerequisites

- **Node.js** (recommended: latest LTS) + **npm**
- **PostgreSQL** (local install or Docker)
- Optional: **Docker** (for Mailpit and/or Postgres)
- For mobile: **Android Studio emulator** or **physical device**, plus Expo tooling

### 1) Backend (API) — `backend`

#### Install

```bash
cd backend
npm install
```

#### Environment variables

Create `backend/.env` (example values below). The backend reads env vars in `backend/src/constants/env.ts`.

```bash
# Server
PORT=5000
NODE_ENV=development

# Database (Postgres)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/food_delivery

# Auth / Security
JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me_too

# CORS / Allowed origins (the web apps)
APP_ORIGIN=http://localhost:3001
CLIENT_WEB_APP_URL=http://localhost:3001
ADMIN_DASHBOARD_URL=http://localhost:5173

# Google OAuth (for social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (image uploads)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_SECRET_KEY=your_cloudinary_api_secret
```

#### Database setup (Drizzle)

From `backend/`:

```bash
# Generate migrations from schema (if needed)
npm run db:generate

# Apply migrations
npm run db:migrate

# Optional: seed data (if you want demo data)
npm run db:seed:all
```

#### Run

```bash
npm run dev
```

- **API base URL (local)**: `http://localhost:5000`
- **API version prefix**: `/api/v1`

#### Mailpit (email testing, optional)

If you want to catch outbound emails locally:

```bash
docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit
docker start mailpit
```

- **Mailpit UI**: `http://localhost:8025`

### 2) Customer Web App (Next.js) — `frontend`

#### Install

```bash
cd frontend
npm install
```

#### Environment variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_API_VERSION_PATH=/api/v1

# Optional
NEXT_PUBLIC_ASSETS_URL=http://localhost:5000
NEXT_PUBLIC_TOKEN_NAME=token

# If you use Google Maps in the web app
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

#### Run

```bash
npm run dev
```

- **Frontend (local)**: `http://localhost:3001`

### 3) Admin Dashboard (Vite) — `dashboard`

#### Install

```bash
cd dashboard
npm install
```

#### Environment variables

Create `dashboard/.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_API_VERSION_PATH=/api/v1

# Optional
VITE_ASSETS_URL=http://localhost:5000
```

#### Run

```bash
npm run dev
```

- **Dashboard (local, default Vite port)**: `http://localhost:5173`

### 4) Rider Mobile App (Expo) — `rider-mobile-app`

#### Install

```bash
cd rider-mobile-app
npm install
```

#### Configure API base URL

The rider app currently uses `SERVER_URL` from `rider-mobile-app/configs/index.ts`.

- For local dev, point it to your machine’s reachable host (for Android emulator this is often `http://10.0.2.2:5000`, for a physical device use your LAN IP like `http://192.168.1.10:5000`).

#### Run

```bash
npm run start
```

Then open on:

- Expo Go (quick testing)
- Android emulator / iOS simulator
- A development build (recommended for production-like testing)

## Useful resources inside the repo

- **Postman collection**: `backend/postman_collection.json`

## Common issues

- **CORS errors**: make sure `CLIENT_WEB_APP_URL` and `ADMIN_DASHBOARD_URL` in `backend/.env` match where your apps are running.
- **Mobile can’t reach localhost**: use emulator/phone reachable host (not `localhost`) for the API base URL.
- **Missing env vars**: the backend will throw early if required vars are not set (DB, JWT secrets, Google OAuth, Cloudinary).