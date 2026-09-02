# MetaBuff Knowledge File
# ─────────────────────────────────────────────────────────────────────────────
# This file is read by Codebuff/Freebuff at the start of every session.
# It primes DeepSeek V4 Pro (with V4 Flash fallback) with codebase context to
# reduce hallucinations.
#
# HOW TO USE:
#   1. Keep this file updated when the project structure changes
#   2. The more accurate this file, the fewer hallucinations you'll see
# ─────────────────────────────────────────────────────────────────────────────

## Project Identity

**Name**: TANGLAW (Tagalog: "light" / "illumination")
**Type**: AI-powered scholarship navigation portal — a full-stack monorepo with a Next.js frontend and an Express + TypeScript backend
**Primary language**: TypeScript
**Framework**: Next.js 16 (App Router) with React 19
**Backend**: Express.js with TypeScript (CommonJS modules, `backend/` directory)
**Package manager**: npm
**Institution**: Polytechnic University of the Philippines (PUP Manila), BSCS 1-2, Science, Technology, and Society (STS)

## Architecture Overview

TANGLAW is a student-led research project that helps Filipino tertiary students find, understand, and apply for scholarships. The app combines a scholarship directory, an interactive readiness assessment, an exam reviewer, and an AI chatbot companion ("Owel" the owl mascot).

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  Vercel (Free)   │────▶│  Render (Free)   │────▶│  Supabase (Free)     │
│  Next.js 16      │     │  Express API     │     │  PostgreSQL          │
│  tanglaw.vercel.app│    │  tanglaw-api.onrender.com│  pgvector enabled    │
└──────────────────┘     └──────────────────┘     └──────────────────────┘
```

**Auth**: NextAuth.js v4 (Credentials provider) on the frontend, JWT (jsonwebtoken + bcryptjs) on the backend
**AI/LLM**: Primary: Google Gemini 3.1 Flash-Lite (via `GOOGLE_API_KEY`, free from Google AI Studio). Fallback: OpenRouter free models. Both frontend (`models.ts`) and backend (`chatService.ts`) follow: Gemini direct → OpenRouter. Backend has 6-model OpenRouter cascade (owl-alpha → nemotron → gpt-oss → llama-3 → qwen-2.5 → gemma-2); frontend uses owl-alpha as single OpenRouter fallback. Also uses LangChain with the Vercel AI SDK (`ai` package).
**Styling**: Tailwind CSS v4 with CSS custom properties (theme variables in globals.css)
**Animations**: Framer Motion
**Icons**: lucide-react
**Validation**: Zod v4

## Directory Layout (Most Important Paths)

```
frontend/                        Next.js 16 app (deployed on Vercel)
  src/app/
    page.tsx                     Public landing page (hero, features, mascot)
    layout.tsx                   Root layout (metadata, fonts, SiteHeader, footer)
    about/page.tsx               About page (mission, team, pillars carousel)
    contact/page.tsx             Contact page (form, address, department info)
    globals.css                  Global styles with CSS custom properties (theme)
    (auth)/
      login/page.tsx             Login page (NextAuth Credentials form)
      signup/page.tsx            Signup page (name, email, password)
    (main)/
      scholarships/page.tsx      Public scholarship redirect → login
      readiness/page.tsx         Public readiness redirect
    dashboard/
      page.tsx                   Dashboard home (module cards)
      layout.tsx                 Dashboard layout (AuthGuard, nav, OwelChatbot)
      scholarships/page.tsx      Scholarship browser (mounted inside dashboard)
      readiness/page.tsx         Readiness assessment page
      reviewer/page.tsx          Exam reviewer page
    api/
      chat/route.ts              Chat API route (LangChain agent executor)
      auth/[...nextauth]/route.ts NextAuth API route handler
  src/components/
    AuthGuard.tsx                Route guard (checks session, redirects to /login)
    site-header.tsx              Public site header with nav links
    NextAuthProvider.tsx         SessionProvider wrapper
    scholarship-browser.tsx      Scholarship discovery with filters/search
    readiness-form.tsx           Interactive timed quiz (Math/Science/English/Filipino)
    owel-chatbot.tsx             Owel AI chatbot widget (preloaded prompts)
    nature-canvas.tsx            Background decoration canvas
    theme-changer.tsx            Theme toggle component
  src/lib/
    backend.ts                   Backend API client (fetch wrappers with JWT token)
    db.ts                        Prisma client singleton
    nextauth.ts                  NextAuth options (Credentials → backend JWT)
    ai/
      models.ts                  AI model factory (Gemini 3.1 Flash-Lite → OpenRouter)
      prompts.ts                 ChatPromptTemplate (Owel system prompt)
      tools.ts                   LangChain tools (searchScholarships, getScholarshipDetails)
  prisma/
    schema.prisma                Database schema (shared with backend)
  package.json                   Frontend dependencies
  tsconfig.json                  TypeScript config (strict, ES2017, bundler)
  vercel.json                    Vercel deploy config (build command, functions)
  next.config.ts                 Next.js config

backend/                         Express API server (deployed on Render)
  src/
    server.ts                    Express entry point (CORS, JSON, routes, error handler)
    routes/
      index.ts                   API router: /health, /auth/*, /scholarships, /messages
    controllers/
      authController.ts          signup, login, logout, me (JWT + bcrypt)
      scholarshipController.ts   getScholarships (filtered, paginated)
      chatController.ts          createMessage, getMessagesForUser (CRUD)
    middleware/
      auth.ts                    JWT authentication middleware (Bearer token)
    services/
      prismaClient.ts            Prisma client singleton (PrismaPg adapter + pg.Pool)
      scholarshipSearchService.ts DB-backed RAG: ILIKE search → formatted LLM context
      chatService.ts             Two-tier RAG: Gemini 3.1 Flash-Lite (primary) → OpenRouter free fallbacks
  prisma/
    schema.prisma                Database schema (source of truth for both FE/BE)
    seed.ts                      Seed script: 8 canonical scholarships
  prisma.config.ts               Prisma v7 datasource config (separate from schema.prisma)
  scripts/
    test_signup.js               Signup test script
    list_scholarships.ts         Scholarship query script
    inspect_user_columns.js      Schema inspection script
  start.sh                       Render start script (prisma db push + seed + start)
  package.json                   Backend dependencies
  tsconfig.json                  TypeScript config (ES2022, CommonJS)
render.yaml                      Render Blueprint (rootDir: backend, Singapore region)
DEPLOY.md                        Full deployment guide (Vercel + Render + Supabase)
README.md                        Project overview and getting started
```

## Key Files (Read These Before Editing Anything)

| File | Role |
|------|------|
| backend/prisma/schema.prisma | Database schema — source of truth for Scholarship, Question, User, Message models + Sector/QuestionType enums |
| backend/prisma.config.ts | Prisma v7 datasource config — URL resolution (DATABASE_URL or DIRECT_URL from .env.local), separate from schema.prisma |
| backend/prisma/seed.ts | Seed script — 8 canonical scholarships, auto-run by start.sh on Render deploy |
| backend/src/routes/index.ts | API route definitions — all endpoints and their middleware |
| backend/src/services/chatService.ts | AI chat pipeline — Gemini 3.1 Flash-Lite primary (GOOGLE_API_KEY) + 6 OpenRouter free fallbacks, RAG with query condensation |
| backend/src/services/scholarshipSearchService.ts | RAG knowledge retrieval — PostgreSQL ILIKE search → formatted context for LLM |
| frontend/src/lib/backend.ts | Frontend API client — fetch wrappers with JWT token management |
| frontend/src/lib/ai/tools.ts | LangChain tools — searchScholarships (by GWA/sector/program) and getScholarshipDetails |
| frontend/src/components/scholarship-browser.tsx | Scholarship directory UI — search, filter by income/sector/program, sessionStorage cache |
| frontend/src/components/readiness-form.tsx | Readiness quiz — timed multi-subject assessment with scoring |
| frontend/src/components/owel-chatbot.tsx | Chatbot widget — preloaded prompts, message persistence to backend |
| frontend/src/app/layout.tsx | Root layout — metadata, fonts (Inter + Outfit), providers, footer |
| frontend/src/app/api/chat/route.ts | Chat API route — LangChain agent executor with scholarship tools |
| frontend/src/app/page.tsx | Landing page — hero, feature cards, mascot animation |
| frontend/src/lib/nextauth.ts | Auth config — NextAuth CredentialsProvider → backend /api/auth/login |

## Import Conventions

- Path alias `@/` maps to `frontend/src/` (e.g., `import { prisma } from '@/lib/db'`)
- No path aliases in backend — relative imports (e.g., `import prisma from "../services/prismaClient"`)
- All imports use ESM syntax in frontend; CommonJS in backend (due to `"module": "commonjs"` in backend tsconfig)
- `@prisma/client` → generated Prisma types (both frontend and backend)
- `@langchain/*` → AI/LLM libraries (both frontend and backend)
- `next-auth/*` → authentication (frontend only)

## Naming Conventions

- Files: kebab-case (`scholarship-browser.tsx`, `authController.ts`)
- React components: PascalCase (`ScholarshipBrowser`, `AuthGuard`, `OwelChatbot`)
- Functions: camelCase (`fetchScholarships`, `generateChatResponse`, `authenticateToken`)
- Backend controllers: camelCase named exports (`signup`, `login`, `getScholarships`)
- Database tables: PascalCase in Prisma (`Scholarship`, `Question`, `User`, `Message`)
- Database columns: camelCase in Prisma (`incomeBracket`, `programCategories`, `passwordHash`)
- Enums: PascalCase (`Sector`, `QuestionType`), values: UPPER_SNAKE (`PUBLIC`, `PRIVATE`, `LOGIC`, `MATH`)
- CSS custom properties: `--theme-*` prefix (`--theme-canvas`, `--theme-typography-main`, `--theme-surface`)

## Type System Notes

- **BackendScholarship** (`frontend/src/lib/backend.ts`): Frontend data shape — `id`, `name`, `provider`, `type` ("Public"|"Private"), `incomeBracket`, `program`, `benefits[]`, `requirements[]`, `link`
- **Scholarship (Prisma)**: Database shape — includes `sector` (PUBLIC|PRIVATE enum), `programCategories` (String[]), `minGwa` (Float), `returnService` (Boolean), `contentVector` (pgvector, optional)
- **BackendUser** (`frontend/src/lib/backend.ts`): `id`, `email`, `name?`
- **BackendMessagePayload**: `role` (string), `content` (string), `metadata?` (unknown)
- **Question (Prisma)**: `id`, `type` (QuestionType enum), `difficulty` (Int), `text`, `choices` (Json), `correctAnswer`, `explanation`
- **BackendMessage** (`frontend/src/lib/backend.ts`): `id`, `role`, `content`, `createdAt`, `metadata?`
- **AuthenticatedRequest** (`backend/src/middleware/auth.ts`): Exported type — `Request & { user?: { id, email, name? } }`. Imported by controllers.
- API responses return Express `res.json()`; no shared ApiResponse wrapper type
- NextAuth session user includes custom `token` field (JWT from backend)

## Database / Backend

**Type**: PostgreSQL (hosted on Supabase)
**ORM/Client**: Prisma v7 with `@prisma/adapter-pg` and raw `pg.Pool` connection pooling
**Vector extension**: pgvector enabled on Supabase for optional `contentVector` field

Key tables:
- `Scholarship` — Scholarship listings. Fields: id, name, provider, sector (PUBLIC|PRIVATE), incomeBracket (String), programCategories (String[]), minGwa (Float), requirements (text), benefits (text), returnService (Boolean), link, contentVector (vector, optional)
- `Question` — Quiz questions. Fields: id, type (LOGIC|MATH|SCIENCE|ENGLISH|FILIPINO), difficulty (Int), text, choices (Json), correctAnswer, explanation
- `User` — Registered students. Fields: id, email (unique), name?, passwordHash?, emailVerified (Boolean), yearLevel?, program?, gwa?, financialStatus?, createdAt. Has one-to-many with Message.
- `Message` — Chat history. Fields: id, role (String), content (String), metadata (Json?), createdAt, userId → User

**Backend API endpoints**:
- `GET /api/health` — health check with uptime
- `POST /api/auth/signup` — register (name, email, password → JWT)
- `POST /api/auth/login` — authenticate (email, password → JWT)
- `POST /api/auth/logout` — logout (requires auth)
- `GET /api/auth/me` — current user info (requires auth)
- `GET /api/scholarships` — list scholarships (requires auth, supports program/sector/gwa/page/pageSize query params)
- `POST /api/messages` — store chat message (requires auth)
- `GET /api/messages` — get current user's messages (requires auth)

**Seed data**: 8 scholarships covering DOST-SEI, CHED Merit, SM Foundation, Manila LGU, Mega-Tech, Health-Care Alliance, Humanities & Arts Fellowship, and Tulong Dunong.

## Test Setup

**Framework**: Minimal — no test runner configured. There are only utility scripts in `backend/scripts/`:
- `test_signup.js` — manual signup test
- `list_scholarships.ts` — scholarship query script
- `inspect_user_columns.js` — schema inspection
**Run command**: No test scripts in package.json for either frontend or backend

## Known Gotchas

- **Prisma v7 config separation**: The backend uses `prisma.config.ts` for datasource URL resolution, separate from `schema.prisma`. This is a Prisma v7 feature. The config file uses `dotenv.config({ path: ".env.local" })` and falls back from DATABASE_URL to DIRECT_URL.
- **Monorepo with two Prisma schemas**: Both `frontend/prisma/schema.prisma` and `backend/prisma/schema.prisma` exist. The backend schema is the source of truth. Changes must be reflected in both.
- **Prisma adapter**: The backend uses `@prisma/adapter-pg` with raw `pg.Pool`, NOT the default Prisma driver. The singleton in `backend/src/services/prismaClient.ts` handles this. The frontend uses a standard PrismaClient singleton in `frontend/src/lib/db.ts`.
- **CommonJS backend**: The backend `tsconfig.json` uses `"module": "commonjs"` and `"moduleResolution": "node"`. Use `require`/`module.exports` style or TypeScript with CommonJS output. Do NOT use top-level `await` or ESM-only packages in the backend.
- **ESM frontend**: The frontend uses `"moduleResolution": "bundler"` and ESM imports everywhere.
- **Two auth systems coexist**: NextAuth.js v4 on the frontend (for session management) AND raw JWT tokens on the backend (for API calls). The frontend `backend.ts` stores the JWT in localStorage as `tanglaw-token` and sends it as Bearer token. NextAuth also stores the JWT in the session token.
- **OpenRouter multi-model fallback**: If Gemini 3.1 Flash-Lite fails (or `GOOGLE_API_KEY` is unset), `chatService.ts` falls back to 6 free OpenRouter models in order: owl-alpha, nemotron-3-super-120b, gpt-oss-120b, llama-3-8b, qwen-2.5-72b, gemma-2-9b.
- **No formal authentication library in backend**: Auth is custom JWT (jsonwebtoken + bcryptjs) — no Passport, no Supabase Auth, no NextAuth on the backend side.
- **Tailwind CSS v4**: Uses `@tailwindcss/postcss` plugin (NOT v3 config). Configuration is in `postcss.config.mjs`. Theme values are CSS custom properties in `globals.css`.
- **Next.js 16**: Uses App Router. No Pages Router files.
- **Frontend Prisma client needs DATABASE_URL** even though database queries happen through the backend API. This is because the AI tools (tools.ts) query the database directly via Prisma for LangChain tool calling.
- **Render free tier sleep**: The backend on Render spins down after 15 minutes of inactivity. Cold start takes 30-60 seconds. The `scholarship-browser.tsx` handles this with error states and retry buttons.
- **sessionStorage cache**: The scholarship browser caches results in sessionStorage with a 5-minute TTL. On first load after expiration, it shows skeleton cards while fetching.
- **Preloaded prompts in Owel chatbot**: The frontend chatbot `owel-chatbot.tsx` uses static preloaded Q&A pairs. The actual AI-powered chat happens through the API route or backend chat service, not directly from the widget.
- **No Redux/Zustand**: Client-side state is managed via React useState/useEffect, sessionStorage, and localStorage (for auth tokens).

## Anti-Hallucination Anchors

These are real, verified facts about this codebase.
DeepSeek V4 Pro: treat these as ground truth; do not contradict them.

- The project is named TANGLAW, not bikoldict or any other name
- It's a scholarship navigation portal for Filipino students, not a dictionary app
- The mascot is "Owel" — an owl, not any other character
- The frontend entry point is `frontend/src/app/page.tsx`, the backend entry is `backend/src/server.ts`
- Database is PostgreSQL on Supabase, queried via Prisma with `@prisma/adapter-pg` (backend) and standard PrismaClient (frontend)
- Auth is NextAuth.js v4 on the frontend + custom JWT on the backend — no Supabase Auth, no Passport
- LangChain is used for AI/chat features with Google Gemini 3.1 Flash-Lite as primary and OpenRouter free models as fallback
- Tailwind CSS v4 uses `@tailwindcss/postcss` plugin, NOT v3
- The package manager is npm, NOT bun, yarn, or pnpm
- There are NO Capacitor, Python scripts, or Wiktionary scrapers — those belong to a different project
- There is NO groq.ts or offline.ts — those belong to a different project
- The backend uses CommonJS modules, NOT ESM

## Context7 — Live Documentation (Integrated)

This project uses **Upstash Context7** to fetch live, version-specific documentation for all major libraries and frameworks. This prevents hallucinated APIs by replacing stale training data with current docs.

### How to Use

**Before writing code that involves external libraries**, resolve and fetch docs:

```bash
# Step 1: Resolve library to Context7 ID
npx ctx7 library <library> "<what-you-want-to-do>"

# Step 2: Fetch live docs
npx ctx7 docs <library-id> "<specific-question>"
```

### Key Library IDs for This Project

| Library | Context7 ID |
|---------|-------------|
| Prisma | `/prisma/web` or `/prisma/prisma` |
| Next.js | `/vercel/next.js` |
| React | `/facebook/react` |
| Tailwind CSS | `/tailwindlabs/tailwindcss` |
| Framer Motion | `/framer/motion` |
| Express | `/expressjs/express` |
| LangChain | `/langchain/langchain` |
| Supabase | `/supabase/supabase` |
| NextAuth.js | `/nextauthjs/next-auth` |

### When to Always Use Context7

- Framework APIs (Next.js route handlers, layouts, metadata, middleware)
- ORM queries (Prisma relations, raw queries, connection pooling, migrations)
- UI libraries (Tailwind CSS v4 patterns, Framer Motion, lucide-react)
- React hooks and patterns (`useActionState`, `useOptimistic`, Server Components)
- Database (PostgreSQL, Supabase, pg.Pool)
- Package configuration (`next.config.ts`, `postcss.config.mjs`, `tsconfig.json`)
- Authentication (NextAuth.js, JWT, bcrypt)

### How Agents Should Use Context7

When writing code that involves an external library, agents should:
1. Run `npx ctx7 library <name> "<question>"` to resolve the library
2. Run `npx ctx7 docs <library-id> "<question>"` to fetch live docs
3. Use the retrieved API signatures and patterns as ground truth

This is especially critical for: Prisma relations/raw queries, Next.js App Router patterns, React 19 hooks, Tailwind CSS v4, LangChain, and any PostgreSQL/Supabase interactions.

## MetaBuff Configuration

```yaml
# Complexity thresholds (affects which pipeline MetaBuff chooses)
simple_max_files: 2       # tasks touching <= 2 files → simple pipeline
complex_max_files: 10     # tasks touching 3-10 files → complex pipeline
mega_threshold: 11        # 11+ files or architectural changes → mega pipeline

# Model override (leave blank to use MetaBuff's default = deepseek/deepseek-v4-pro; falls back to deepseek-v4-flash when unavailable)
model_override: ""

# Parallel agent limit for metabuff-mega
max_parallel_agents: 8

# Run validator after every pipeline (recommended: true)
always_validate: true
```

## Agent Pipeline Guardrails (P0–P3)

The following rules must be followed by Buffy at every spawn point to prevent silent failures.
They are ranked by priority: P0 (must-do), P1 (should-do), P2 (good-to-do), P3 (nice-to-do).

### P0 — Critical (Silent Failure Prevention)

**F1 — Task-Drift Guard**

F1 operates at **two layers**: a prompt-level preamble AND a runtime enforcement gate. Both are required.

### Layer 1: Prompt-Level Preamble

When spawning any reasoning agent (`metabuff-reasoner`, `thinker-gpt`, `thinker-with-files-gemini`, `metabuff-arch`), always prefix the prompt with a task-verification block:
```
TASK VERIFICATION
─────────────────
Your assigned task is: "<exact task>". This is a meta-analysis / reasoning task.
Do NOT call terminal commands, search the codebase, read files, or edit files.
Ignore project context (file trees, git diffs, code snippets) unless directly relevant.
Begin by restating your understanding of the task before proceeding.

SELF-ABORT CLAUSE
─────────────────
If you detect yourself reaching for any of the following, you are drifting off-task:
- A tool call (run_terminal_command, code_search, str_replace, write_file, read_files, or any other tool except set_output)
- A sub-agent spawn (spawn_agents — reasoning agents may not delegate tool work to sub-agents)

If drift is detected:
1. STOP immediately.
2. Call set_output with: { "message": "[F1 ABORT] Task-drift detected. I attempted to call a blocked tool or spawn a sub-agent. Aborting." }
3. Do NOT proceed with the blocked action.
```

### Layer 2: Runtime Enforcement (Tool-Access Gate)

Prompt-level instructions are insufficient — reasoning agents have been demonstrated to ignore the preamble and call tools anyway (see `F1-ENFORCEMENT-ADR.md`).

The runtime enforcement gate sits in the tool dispatch layer and blocks tool calls from reasoning agents at the system level:

**Gated agents**: `metabuff-reasoner`, `thinker-gpt`, `thinker-with-files-gemini`, `metabuff-arch`
**Allowed tools**: `set_output` only
**Blocked behavior**: Any other tool call is intercepted and returns an F1 error. The agent session is optionally terminated.
**Spawn prevention**: Reasoning agents may not spawn sub-agents (prevents bypass via spawning a basher).

**Configuration**: `.impeccable/live/f1-guard.json`
**Full ADR**: `F1-ENFORCEMENT-ADR.md`

### Enforcement Rules for Buffy

1. Always include the F1 preamble (with self-abort clause) when spawning any reasoning agent.
2. Ensure `.impeccable/live/f1-guard.json` exists and is loaded by the agent harness.
3. If the runtime gate is NOT available (e.g., running in an environment without hook support), the preamble becomes the sole defense. In this case, add stronger language to the preamble and monitor the agent's output for drift.

**F2 — Destructive Command Classifier**
Before every `basher` or `tmux-cli` spawn, classify the command and enforce:
- **READ_ONLY** (`ls`, `cat`, `head`, `tail`, `grep`, `find`, `echo`, `npx tsc --noEmit`, `npx prisma generate`): Safe to run. Still include `what_to_summarize`.
- **READ_WRITE** (`npm install`, `npx prisma db push`, `prisma migrate`, `git add`, `git commit`): Must include `what_to_summarize` describing what changed and confirmation of no adverse effects.
- **DESTRUCTIVE** (`rm -rf`, `git push --force`, `npx prisma db push --force-reset`, `npm publish`, `npm run <script>` with write access, `git reset --hard`): **Must ask the user for confirmation before spawning.** Never auto-run.

### P1 — High (Integrity Protection)

**F3 — Cascade Validation (metabuff-mega)**
When using `metabuff-mega`:
1. Validate each wave's outputs before spawning the next wave.
2. Check that file edits make sense given the task.
3. If any output is clearly wrong, do not proceed — re-spawn or fix before continuing.

**F4 — Context Minimization**
When spawning any sub-agent:
1. Strip unrelated conversation turns from the prompt.
2. Do not dump full file trees, git diffs, or project-wide context into sub-agent prompts.
3. Only include context that is directly relevant to the agent's specific task.
4. Example: if spawning a basher to `npm run build`, don't include the entire project architecture.

**F5 — Diff Review After Every Edit**
After every `str_replace` or `write_file`:
1. Spawn `code-reviewer-deepseek-flash` to review the changes.
2. Verify the change only modified what was intended (no phantom edits).
3. If the change involves external libraries, verify imports are correct.

### P2 — Medium (Quality Assurance)

**F6 — File Lock Tracking for Parallel Agents**
When spawning parallel agents (via `metabuff-mega`):
1. Track which files each agent is editing.
2. If two agents in the same wave target the same file, do not run them in parallel.
   Instead, run them sequentially with a merge review step in between.
3. After parallel execution, check for overlapping edits and flag conflicts.

**F7 — Automatic Regex Guard**
After any `str_replace` or `write_file` that contains regex patterns
(`.match()`, `.replace()`, `new RegExp()`, `RegExp`, or string pattern args):
1. Auto-spawn `metabuff-regex-guard` to validate the regex patterns.
2. LLMs frequently produce runtime-invalid regex that TypeScript silently accepts.

### P3 — Low (Housekeeping)

**F8 — tmux Session Cleanup**
After spawning `tmux-cli`:
1. Track the session name from the agent's output.
2. If the agent fails, times out, or errors: immediately run `tmux kill-session -t <sessionName>`.
3. Include cleanup in any error handling path.

**F9 — Model Check at Session Start**
At the start of each session (or when spawning credit-costly agents):
1. Note the active model to the user if ambiguous.
2. If running on a fallback model (e.g., deepseek-v4-flash instead of deepseek-v4-pro),
   explicitly notify the user: "Running on [model]. Quality may differ from primary."

**F10 — Output Validation for Data Agents**
After receiving results from `code-searcher` or `file-picker`:
1. Verify the output makes sense before acting on it.
2. If `code-searcher` returns zero results, try alternate patterns before concluding
   the code doesn't exist.
3. If `file-picker` returns files unrelated to the task, re-pick with more specific
   directories.
