# Tanglaw Backend

This backend is a lightweight Express + TypeScript API service for the Tanglaw scholarship portal. It exposes sample scholarship data and message persistence endpoints used by the frontend.

## Quickstart

```bash
cd backend
npm install
npm run dev
```

## Available endpoints

- `GET /api/health` — service health check
- `POST /api/auth/signup` — create a password account
- `POST /api/auth/login` — issue a seven-day backend JWT for a password account
- `POST /api/auth/oauth/exchange` — exchange a verified NextAuth Google/Azure AD identity for a backend JWT (server bridge secret required)
- `GET /api/auth/me` — return the authenticated backend user
- `GET /api/scholarships` — sample scholarship data
- `POST /api/messages` — create a new chat message record
- `GET /api/messages/:userId` — retrieve chat messages for a given user

## Build and run

```bash
npm run build
npm start
```

The OAuth bridge smoke check uses only Node's built-in assertions and the
backend's existing PostgreSQL/JWT dependencies. Run it against a disposable
database, never production:

```bash
OAUTH_TEST_DATABASE_URL="postgresql://..." npm run build
OAUTH_TEST_DATABASE_URL="postgresql://..." npm run test:oauth
```
