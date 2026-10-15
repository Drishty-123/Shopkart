# ShopKart Frontend — Login → Home Flow

React + Vite + React Router + Axios + Tailwind CSS v4.

## Setup

```bash
npm install
npm run dev
```

Runs on http://localhost:5173 by default.

## Backend

This expects your Lab 01 backend running at `http://localhost:3000`
(see `src/services/api.js` to change the URL). Start it with:

```bash
cd path/to/shopkart-auth-service/backend
npm install
npm run dev   # or: node index.js
```

Make sure the backend's CORS config (if any) allows `http://localhost:5173`
with `credentials: true`, since the frontend sends `withCredentials: true`
so the HttpOnly login cookie is stored and sent back automatically.

## Pages

- `/register` — create an account, then redirects to `/login`
- `/login` — logs in, sets the HttpOnly cookie, redirects to `/home`
- `/home` — protected: fetches `GET /customers/me`; bounces to `/login`
  if that request fails (no/invalid cookie)

Logout (navbar button) calls `POST /customers/logout` and redirects
back to `/login`.
