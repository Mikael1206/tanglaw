# TANGLAW — Scholarship Navigation Portal

**University**: Polytechnic University of the Philippines (PUP Manila), BSCS 1-2
**Course**: Science, Technology, and Society (STS)
**Mascot**: Owel (an owl — symbolizing wisdom and guidance)

AI-powered scholarship navigation portal for Filipino tertiary students. Combines a scholarship directory, readiness assessment, exam reviewer, and AI chatbot companion.

---

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  Vercel (Free)   │────▶│  Render (Free)   │────▶│  Supabase (Free)     │
│  Next.js 16      │     │  Express API     │     │  PostgreSQL          │
│  tanglaw.vercel.app│    │  tanglaw-api.onrender.com│  pgvector enabled    │
└──────────────────┘     └──────────────────┘     └──────────────────────┘
```

---

## Stack (with exact versions)

| Layer | Technology | Version | Config File |
|-------|-----------|---------|-------------|
| Frontend | Next.js (App Router) | 16.2.6 | `frontend/next.config.ts` |
| UI | React | 19.2.4 | `frontend/tsconfig.json` |
| Language | TypeScript (strict, ESM) | ^5.9.3 | `frontend/tsconfig.json` (target ES2017, bundler) |
| Backend | Express.js | ^4.18.2 | `backend/tsconfig.json` (CommonJS, target ES2022) |
| ORM | Prisma | 7.8.0 | `backend/prisma/schema.prisma` |
| Database | PostgreSQL (Supabase, Singapore) | — | `render.yaml` env vars |
| Auth (FE) | NextAuth.js v4 (Credentials) | ^4.24.14 | `frontend/src/lib/nextauth.ts` |
| Auth (BE) | JWT (jsonwebtoken + bcryptjs) | ^9.0.0 / ^2.4.3 | `backend/src/middleware/auth.ts` |
| AI (primary) | Google Gemini 3.1 Flash-Lite | — | via `GOOGLE_API_KEY` env var |
| AI (fallback) | OpenRouter free models (6-model cascade) | — | via `OPENROUTER_API_KEY` env var |
| AI framework | LangChain (Core, Google GenAI, OpenAI) | ^1.1.48+ | `backend/src/services/chatService.ts` |
| Styling | Tailwind CSS v4 (CSS custom properties) | ^4 | `frontend/postcss.config.mjs` |
| Animations | Framer Motion | ^11.0.0 | Imported per component |
| Icons | lucide-react | ^0.474.0 | Imported per component |
| Validation | Zod | ^4.4.3 | `frontend/src/lib/backend.ts` types |
| Testing | Vitest (unit) + Playwright (E2E) | ^4.1.8 / ^1.60.0 | `frontend/vitest.config.ts`, `playwright.config.ts` |
| Linting | ESLint | ^9 (FE) / ^8 (BE) | `frontend/eslint.config.mjs`, backend config |
| Package Mgr | npm | — | `package.json` at root |
| Hosting | Vercel (FE free) + Render (BE free) | — | `render.yaml` (Blueprint) + Vercel dashboard |
| Deploy trigger | GitHub push to `main` | — | Auto-deploy on both Vercel + Render |

---

## Critical Rules (must never violate)

### 1. CommonJS vs ESM

```typescript
// ✅ BACKEND — CommonJS
// backend/tsconfig.json: "module": "commonjs", "moduleResolution": "node"
import express from 'express'          // OK — TypeScript compiles to require()
// ❌ NO top-level await
// ❌ NO ESM-only packages

// ✅ FRONTEND — ESM
// frontend/tsconfig.json: "module": "esnext", "moduleResolution": "bundler"
import { prisma } from '@/lib/db'      // OK — uses @/ alias
import { Scholarship } from '@/components/scholarship-browser'
```

### 2. Two Prisma Schemas — Mirror Both

| File | Role |
|------|------|
| `backend/prisma/schema.prisma` | **Source of truth** — edit this first |
| `frontend/prisma/schema.prisma` | **Mirror** — make identical changes here |

When editing the Prisma schema, ALWAYS update both files. Then run:
```bash
cd backend && npx prisma generate
cd frontend && npx prisma generate
```

### 3. Two Auth Systems — Never Mix

| System | Technology | Purpose | Token Location |
|--------|-----------|---------|---------------|
| Frontend session | NextAuth.js v4 (CredentialsProvider) | `useSession()`, session cookies | In NextAuth JWT |
| Backend API | Custom JWT (jsonwebtoken) | Authenticate API calls | `localStorage` as key `tanglaw-token`, sent as `Bearer` header |

Signup/login flow:
1. User submits credentials → NextAuth calls backend `POST /api/auth/login`
2. Backend returns JWT → NextAuth stores JWT in its session token
3. Frontend also stores JWT in `localStorage` as `tanglaw-token`
4. API client (`frontend/src/lib/backend.ts`) reads `tanglaw-token` from localStorage
5. Backend middleware (`backend/src/middleware/auth.ts`) verifies the `Bearer` token

### 4. Render Cold Starts

Backend on Render free tier spins down after **15 minutes of inactivity**. First request after idle:
- Cold start takes **30-60 seconds**
- `scholarship-browser.tsx` handles this with error states + retry buttons
- Frontend should show loading/retry UI, not break

### 5. Path Aliases

```typescript
// FRONTEND only — @/ maps to frontend/src/
import { prisma } from '@/lib/db'         // resolves: frontend/src/lib/db
import { AuthGuard } from '@/components/AuthGuard'

// BACKEND only — relative imports
import prisma from '../services/prismaClient'
import { authenticateToken } from '../middleware/auth'
```

---

## Directory Map

```
tanglaw/
├── CLAUDE.md                         ← You are here
├── knowledge.md                      ← MetaBuff knowledge file (project context for AI)
├── package.json                      ← Root (Playwright + TypeScript dev deps only)
├── playwright.config.ts              ← E2E test config (tests in frontend/src/__e2e__/)
├── render.yaml                       ← Render Blueprint (rootDir: backend, Singapore region)
├── DEPLOY.md                         ← Full deployment guide
├── DESIGN.md                         ← Design system (colors, typography, components)
├── PRODUCT.md                        ← Product vision, brand personality
│
├── frontend/                         ← Next.js 16 App Router (Vercel)
│   ├── package.json                  ← npm dependencies
│   ├── next.config.ts                ← Next.js config (image formats, package optimization)
│   ├── tsconfig.json                 ← Strict, ES2017, bundler resolution
│   ├── postcss.config.mjs            ← Tailwind v4 PostCSS plugin
│   ├── vitest.config.ts              ← Vitest config
│   ├── eslint.config.mjs             ← ESLint flat config
│   ├── src/
│   │   ├── app/                      ← App Router pages
│   │   │   ├── layout.tsx            ← Root layout (fonts, providers, footer)
│   │   │   ├── page.tsx              ← Landing page (hero, features, mascot)
│   │   │   ├── globals.css           ← CSS custom properties (--theme-*)
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx    ← Login (NextAuth Credentials form)
│   │   │   │   └── signup/page.tsx   ← Signup (name, email, password)
│   │   │   ├── (main)/
│   │   │   │   ├── scholarships/page.tsx  ← Redirects to /dashboard/scholarships
│   │   │   │   └── readiness/page.tsx     ← Redirects to /dashboard/readiness
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx        ← AuthGuard + nav + OwelChatbot
│   │   │   │   ├── page.tsx          ← Dashboard home (module cards)
│   │   │   │   ├── scholarships/page.tsx ← Scholarship browser
│   │   │   │   ├── readiness/page.tsx    ← Readiness assessment quiz
│   │   │   │   └── reviewer/page.tsx     ← Exam reviewer
│   │   │   ├── about/page.tsx        ← About page
│   │   │   └── contact/page.tsx      ← Contact page
│   │   │   └── api/
│   │   │       ├── chat/route.ts     ← LangChain agent executor
│   │   │       └── auth/[...nextauth]/route.ts ← NextAuth API handler
│   │   ├── components/
│   │   │   ├── AuthGuard.tsx         ← Route guard (redirects to /login)
│   │   │   ├── site-header.tsx       ← Public site header
│   │   │   ├── NextAuthProvider.tsx  ← SessionProvider wrapper
│   │   │   ├── scholarship-browser.tsx ← Scholarship discovery (search, filters, cache)
│   │   │   ├── readiness-form.tsx    ← Timed multi-subject quiz
│   │   │   ├── owel-chatbot.tsx      ← AI chatbot widget (preloaded prompts)
│   │   │   ├── nature-canvas.tsx     ← Background decoration canvas
│   │   │   └── theme-changer.tsx     ← Theme toggle
│   │   └── lib/
│   │       ├── backend.ts            ← API client (fetch wrappers, JWT management)
│   │       ├── db.ts                 ← Prisma client singleton
│   │       ├── nextauth.ts           ← NextAuth config (Credentials → backend JWT)
│   │       └── ai/
│   │           ├── models.ts         ← AI model factory (Gemini → OpenRouter)
│   │           ├── prompts.ts        ← ChatPromptTemplate (Owel system prompt)
│   │           └── tools.ts          ← LangChain tools (searchScholarships, getScholarshipDetails)
│   └── prisma/
│       └── schema.prisma             ← Mirror of backend schema
│
├── backend/                          ← Express API server (Render)
│   ├── package.json                  ← npm dependencies
│   ├── tsconfig.json                 ← CommonJS, ES2022, node resolution
│   ├── prisma.config.ts              ← Prisma v7 datasource config (DATABASE_URL / DIRECT_URL)
│   ├── start.sh                      ← Render start: db push + seed + start
│   ├── prisma/
│   │   ├── schema.prisma             ← SOURCE OF TRUTH (Scholarship, Question, User, Message)
│   │   └── seed.ts                   ← 8 canonical scholarships
│   ├── scripts/
│   │   ├── test_signup.js            ← Manual signup test
│   │   ├── list_scholarships.ts      ← Scholarship query script
│   │   └── inspect_user_columns.js   ← Schema inspection
│   └── src/
│       ├── server.ts                 ← Express entry (CORS, JSON, routes, error handler)
│       ├── routes/index.ts           ← All API route definitions
│       ├── controllers/
│       │   ├── authController.ts     ← signup, login, logout, me
│       │   ├── scholarshipController.ts ← getScholarships (filtered, paginated)
│       │   └── chatController.ts     ← createMessage, getMessagesForUser
│       ├── middleware/auth.ts        ← JWT auth middleware (Bearer token)
│       └── services/
│           ├── prismaClient.ts       ← Prisma singleton (@prisma/adapter-pg + pg.Pool)
│           ├── scholarshipSearchService.ts ← ILIKE search → formatted LLM context
│           └── chatService.ts        ← AI pipeline: Gemini → 6 OpenRouter fallbacks
│
└── .claude/skills/                   ← Loaded DAILY skills
    ├── frontend-patterns/SKILL.md
    ├── backend-patterns/SKILL.md
    ├── api-design/SKILL.md
    ├── security-review/SKILL.md
    ├── documentation-lookup/SKILL.md
    ├── nextjs-turbopack/SKILL.md
    ├── e2e-testing/SKILL.md
    ├── verification-loop/SKILL.md
    ├── coding-standards/SKILL.md
    ├── strategic-compact/SKILL.md
    └── skill-library/SKILL.md        ← LIBRARY skill router (off-stack / optional)
```

---

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check with uptime |

### Auth (no token required)
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/signup` | `{ name, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |

### Auth (token required — `Bearer <token>`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/logout` | End session |
| GET | `/api/auth/me` | Current user info |

### Protected (auth required)
| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| GET | `/api/scholarships` | `?program=&sector=&gwa=&page=1&pageSize=10` | Filtered, paginated scholarships |
| POST | `/api/messages` | — | Store chat message |
| GET | `/api/messages` | — | Get current user's messages |

---

## Database Schema (Prisma)

```prisma
model Scholarship {
  id                String    @id @default(uuid())
  name              String
  provider          String
  sector            Sector    // PUBLIC | PRIVATE
  incomeBracket     String
  programCategories String[]
  minGwa            Float
  requirements      String
  benefits          String
  returnService     Boolean
  link              String
  contentVector     Unsupported("vector")?  // pgvector (optional)
}

model Question {
  id            String       @id @default(uuid())
  type          QuestionType // LOGIC | MATH | SCIENCE | ENGLISH | FILIPINO
  difficulty    Int
  text          String
  choices       Json
  correctAnswer String
  explanation   String
}

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  name            String?
  passwordHash    String?
  emailVerified   Boolean   @default(false)
  yearLevel       String?
  program         String?
  gwa             Float?
  financialStatus String?
  createdAt       DateTime  @default(now())
  messages        Message[]
}

model Message {
  id        String   @id @default(uuid())
  role      String
  content   String
  metadata  Json?
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## Common Scripts

### Frontend (`cd frontend`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run analyze` | Bundle analyzer |
| `npx vitest run` | Run unit tests |
| `npx tsc --noEmit` | TypeScript typecheck |

### Backend (`cd backend`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (ts-node-dev, port 5000) |
| `npm run build` | Compile TypeScript → CommonJS in `dist/` |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run seed` | Run seed script (8 scholarships) |
| `npx tsc --noEmit` | TypeScript typecheck |
| `npx prisma generate` | Regenerate Prisma client after schema change |
| `npx prisma db push` | Push schema to database (no migration file) |

### Root

| Command | Purpose |
|---------|---------|
| `cd frontend && npm run dev` | Start frontend dev server |
| `cd backend && npm run dev` | Start backend dev server |
| `npx playwright test` | Run E2E tests (see playwright.config.ts) |

---

## Environment Variables

### Frontend (Vercel)

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_BACKEND_URL` | Render URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `NEXTAUTH_SECRET` | Random 32+ char string |
| `DATABASE_URL` | Supabase connection string |

### Backend (Render)

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Supabase pooler (port 6543) |
| `DIRECT_URL` | Supabase direct (port 5432) |
| `JWT_SECRET` | Auto-generated by Render |
| `FRONTEND_URL` | Vercel deployment URL |
| `GOOGLE_API_KEY` | Google AI Studio (for Gemini) |
| `OPENROUTER_API_KEY` | OpenRouter (for fallback LLM) |

---

## Design System

**Creative North Star**: "The Guiding Beacon" — clarity and hope for students.

**Colors**: Deep Marine `#1B4079` (primary), Verdant Sage `#CBDF90` (canvas), Morning Mist `#F4F9E2` (surface)

**Typography**: Outfit (display, black 900) + Inter (body, 400, 1.6 line-height)

**Corners**: Rounded-xl (24px) for cards, pill-shaped (9999px) for buttons

See `DESIGN.md` for the full design system specification.

---

## AI/LLM Pipeline

```
User message
  → LangChain Agent Executor (frontend/src/app/api/chat/route.ts)
    → Scholarship tools (searchScholarships, getScholarshipDetails)
      → PostgreSQL ILIKE search (scholarshipSearchService.ts)
        → Formatted RAG context
  → LLM Response
    1st: Google Gemini 3.1 Flash-Lite (GOOGLE_API_KEY)
    Fallback: OpenRouter cascade (owl-alpha → nemotron → gpt-oss → llama-3 → qwen-2.5 → gemma-2)
```

---

## Verification Checklist

Before committing or deploying:

```
[ ] Frontend typecheck: cd frontend && npx tsc --noEmit
[ ] Backend typecheck:  cd backend && npx tsc --noEmit
[ ] Frontend lint:      cd frontend && npm run lint
[ ] Backend lint:       cd backend && npm run lint
[ ] Frontend build:     cd frontend && npm run build
[ ] Backend build:      cd backend && npm run build
[ ] Frontend tests:     cd frontend && npx vitest run
[ ] Prisma schema mirrored to both frontend/prisma/ and backend/prisma/
[ ] Prisma client regenerated in BOTH: cd backend && npx prisma generate && cd ../frontend && npx prisma generate
[ ] No secrets committed to git
[ ] No console.log left in production code
```
