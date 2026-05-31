# Tanglaw

TANGLAW is an AI-powered scholarship navigation portal built with a Next.js frontend and an Express + TypeScript backend. The app combines a secure student dashboard, scholarship discovery tools, readiness assessment modules, and an AI-guided chat companion.

## Repository structure

- `frontend/` — Next.js app with UI components, AI helpers, Supabase client setup, and dashboard pages.
- `backend/` — Express API service with mock scholarship data, chat persistence endpoints, and Prisma client support.

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend

```bash
cd backend
npm install
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) if the backend is configured to use port `4000`.

## Key features

- Secure dashboard access using localStorage-based auth guard.
- Scholarship browser with filtering and eligibility-focused recommendations.
- Interactive readiness quiz and exam reviewer tools.
- AI companion integration using LangChain tool calling.
- Simple backend endpoints for health, scholarship mock data, and message persistence.

## Frontend pages

- `/` — Landing page with product overview and navigation.
- `/about` — Team, goals, and project pillars.
- `/contact` — Contact form and support details.
- `/login` and `/signup` — Authentication entry points.
- `/dashboard` — Authenticated dashboard home.
- `/dashboard/scholarships` — Scholarship search module.
- `/dashboard/readiness` — Readiness assessment module.
- `/dashboard/reviewer` — Exam review module.

## Backend endpoints

- `GET /api/health` — service health check.
- `GET /api/scholarships` — returns mock scholarship metadata.
- `POST /api/messages` — store a chat message in the database.
- `GET /api/messages/:userId` — fetch user messages.

## Deploy and build

Use standard Next.js and Node scripts to build and deploy each directory independently.

### Frontend build

```bash
cd frontend
npm run build
npm run start
```

### Backend build

```bash
cd backend
npm run build
npm start
```

## Notes

The frontend currently uses simulated auth state in local storage and integrates with AI tools for advanced scholarship search and detail retrieval.
