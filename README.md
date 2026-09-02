# TANGLAW

TANGLAW (Tagalog for "light" or "illumination") is an AI-powered scholarship navigation portal designed for Filipino tertiary students. It combines a scholarship directory, readiness assessment, exam reviewer, and an AI chatbot companion into a single, guided dashboard experience.

---

## Problem

Filipino tertiary students face significant barriers when searching for and applying to scholarships. According to recent data, only 30.5% of Grade 3 learners show basic reading proficiency and just 0.47% of Grade 12 learners demonstrate grade-level readiness. Scholarship research is noisy, fragmented, and difficult to navigate. Many students lack access to verified grant sources, eligibility summaries, and application support tools in one place, leaving them overwhelmed and underserved by existing resources.

---

## Solution

TANGLAW addresses these challenges by providing a centralized, AI-powered platform that simplifies scholarship discovery and preparation. The system is a full-stack application with a Next.js frontend, Express backend, PostgreSQL database, LangChain AI integration, and Supabase hosting. Users can register, browse scholarships with advanced filtering, take readiness assessments, review exam materials, and chat with an AI companion named Owel to guide them through the application journey. The portal focuses on making scholarships easier to find, understand, and act on.

---

## Technologies Used

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, lucide-react |
| **Backend** | Express.js, TypeScript (CommonJS), Prisma v7 ORM |
| **Database** | PostgreSQL (Supabase), pgvector for embeddings |
| **AI / LLM** | Google Gemini 3.1 Flash-Lite (primary), OpenRouter free models (fallback cascade), LangChain |
| **Authentication** | NextAuth.js v4 (Credentials, Google, Microsoft Entra), JWT (jsonwebtoken + bcryptjs) |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Deployment** | Vercel (frontend), Render (backend), Supabase (database) |
| **Package Manager** | npm |

---

## Key Features

- **Scholarship Browser** — Search and filter scholarships by income bracket, sector (public/private), and program category with eligibility recommendations
- **Readiness Assessment** — Timed multi-subject quiz covering Math, Science, English, Filipino, and Logic
- **Exam Reviewer** — Review practice questions with explanations and difficulty levels
- **AI Chatbot Companion** — Owel, an AI-powered assistant using RAG (Retrieval-Augmented Generation) to answer scholarship-related queries
- **Secure Student Dashboard** — Protected routes with NextAuth.js authentication and JWT-based API access
- **Responsive UI** — Animated, accessible interface built with Framer Motion and Tailwind CSS

---

## How to Run the Project

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase account (for PostgreSQL database)

### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

The backend runs on `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

### Optional Checks

```bash
# TypeScript typecheck
cd frontend && npx tsc --noEmit

# Lint
cd frontend && npm run lint

# Unit tests
cd frontend && npx vitest run

# E2E tests (requires running dev server)
npx playwright test
```

---

## Project Structure

```
tanglaw/
├── frontend/                  — Next.js 16 App Router (deployed on Vercel)
│   ├── src/app/               — Pages and API routes
│   │   ├── (auth)/            — Login and signup pages
│   │   ├── dashboard/         — Authenticated dashboard (scholarships, readiness, reviewer)
│   │   ├── api/               — Chat API and NextAuth handler
│   │   └── page.tsx           — Landing page
│   ├── src/components/        — UI components (scholarship browser, chatbot, quiz)
│   └── src/lib/               — API client, auth config, AI model tools
│
├── backend/                   — Express API (deployed on Render)
│   ├── src/
│   │   ├── controllers/       — Auth, scholarship, and chat controllers
│   │   ├── middleware/        — JWT authentication middleware
│   │   ├── routes/            — API route definitions
│   │   └── services/          — Prisma client, chat service, scholarship search
│   ├── prisma/                — Database schema (source of truth) and seed data
│   └── start.sh               — Render deploy script
│
├── CLAUDE.md                  — Project context for AI assistants
├── DESIGN.md                  — Design system specification
├── PRODUCT.md                 — Product vision and brand personality
├── DEPLOY.md                  — Full deployment guide (Vercel + Render + Supabase)
└── render.yaml                — Render Blueprint configuration
```

---

## License

This project is intended for academic and project submission use.

---

## Documentation & Development Team

### Documentation Team

| Name | Role |
|------|------|
| Godsent John C. Salvaloza | Documentation Head |
| Rhaine Venice B. Bonador | Introduction Writer |
| Kyle Ashley B. Madera | Statement of the Problem Writer |
| Hannah Mae V. Alberto | RRL Lead Writer |
| Hannah Nicole B. Partible | RRL Assistant & Citation Checker |
| Emerald T. Perez | Methodology Writer |
| Julliane Mae G. Araullo | Results Writer |
| Daniel F. Pajares | Discussion Writer |

### Development Team

| Name | Role |
|------|------|
| Bennett P. Payoyo | Project Manager |
| An-joe Mikael T. Albano | Frontend Developer |
| Levrone Viel S. Delos Reyes | Frontend & QA |
| Charles Joseph V. Faustino | Backend Developer & Database Manager |
| Justin Angelo G. Cruz | QA Tester / Technical Documentation |

**Institution:** Polytechnic University of the Philippines (PUP Manila) — BSCS 1-2, Science, Technology, and Society (STS)
