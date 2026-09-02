# Tanglaw — Deployment Guide (Vercel + Render)

**Total cost: $0. No credit card needed.**

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────────┐
│  Vercel (Free)   │────▶│  Render (Free)   │────▶│  Supabase (Free)     │
│  Next.js 16      │     │  Express API     │     │  PostgreSQL          │
│  tanglaw-project.vercel.app│    │  tanglaw-api.onrender.com│  pgvector enabled    │
└──────────────────┘     └──────────────────┘     └──────────────────────┘
```

---

## Prerequisites

- ✅ A **GitHub account** (free)
- ✅ Your project pushed to GitHub: `https://github.com/Yahiro025/tanglaw`
- ✅ A **Supabase account** (free at [supabase.com](https://supabase.com))
- ✅ An **OpenRouter account** (free at [openrouter.ai](https://openrouter.ai) — get API key)
- ✅ A **Render account** (free at [render.com](https://render.com) — sign in with GitHub, **no card needed**)
- ✅ A **Vercel account** (free at [vercel.com](https://vercel.com) — sign in with GitHub, **no card needed**)

---

## Step 1 — Set Up Supabase PostgreSQL (Free)

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New Project**
3. Fill in:
   - **Name**: `tanglaw`
   - **Database Password**: Copy this somewhere safe
   - **Region**: `Singapore` (closest to Philippines)
   - **Pricing Plan**: **Free**
4. Click **Create new project** (takes ~2 min)
5. Once created, go to **Project Settings → Database**
   - Copy your **Connection string** (URI format): `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
   - This is your `DATABASE_URL` and `DIRECT_URL`

### Enable pgvector extension (required by Prisma schema)

1. In Supabase Dashboard, go to **SQL Editor**
2. Run this SQL:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
3. Click **Run**

---

## Step 2 — Set Up OpenRouter API Key (Free)

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up with Google or GitHub
3. Click **Create Key**
4. Copy the key — it starts with `sk-or-v1-`

> **No money needed**: OpenRouter offers free models. Your `chatService.ts` is already configured to use the free models first.

---

## Step 3 — Deploy Backend to Render (Free, No Card)

1. Go to [render.com](https://render.com) and click **Get Started**
2. Sign in with **GitHub** — **no credit card required**
3. Click **New + → Blueprint** (this uses the `render.yaml` we created)
4. Select your repository: `Yahiro025/tanglaw`
5. Click **Apply** — `rootDir` is already set in `render.yaml`, so no need to configure it manually

Render will read `render.yaml` at the project root and create the service automatically.

### Set Environment Variables on Render

After the initial deploy (it will fail the first time — that's expected), go to your service dashboard:

1. Click **Environment** in the left sidebar
2. Add these variables:

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | `https://tanglaw-project.vercel.app` (no trailing slash) |
| `DATABASE_URL` | **Pooler connection string** from Supabase (port 6543) — see note below |
| `DIRECT_URL` | Direct connection string from Step 1 (port 5432) — for `prisma db push` |
| `OPENROUTER_API_KEY` | Your key from Step 2 |
| `JWT_SECRET` | A random server-only secret (Render can generate it) |
| `OAUTH_BRIDGE_SECRET` | A random server-only secret shared only with Vercel; generate it independently from `NEXTAUTH_SECRET`, `JWT_SECRET`, and `GOOGLE_API_KEY` |

> ⚠️ **Important:** Supabase free-tier databases use **IPv6 only** on the direct port (5432). Render's free plan may not support IPv6 outbound connections. You **must** use the **connection pooler** (port **6543**) for `DATABASE_URL`.
>
> To get the pooler URL:
> 1. Go to **Supabase Dashboard → Project Settings → Database**
> 2. Scroll to **Connection pooler** section
> 3. Copy the **Transaction** connection string (port 6543)
>    - Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
> 4. Set this as `DATABASE_URL` on Render
> 5. Keep `DIRECT_URL` as the original port 5432 connection string (for `prisma db push`)

3. Click **Save Changes**
4. Go to **Manual Deploy → Deploy latest commit** to rebuild

### Verify Backend is Working

Once deployed, visit: `https://tanglaw-api.onrender.com/api/health`

You should see:
```json
{"status":"ok","message":"Tanglaw backend is running."}
```

Save your Render URL: `https://tanglaw-api.onrender.com` — you'll need this for the frontend.

> **⚠️ Cold start note:** Render's free service spins down after 15 minutes of inactivity. After a cold start, the first request takes ~30-60 seconds. To keep it warm for free, see **Step 5** below.

---

## Step 4 — Deploy Frontend to Vercel (Free, No Card)

1. Go to [vercel.com](https://vercel.com) and click **Log In**
2. Sign in with **GitHub** — **no credit card required**
3. Click **Add New → Project**
4. Find and select your repo: `Yahiro025/tanglaw`
5. **Root Directory**: `frontend`
6. **Framework Preset**: Vercel will auto-detect **Next.js** ✅
7. **Build Command**: Already set in `vercel.json` — `prisma generate && npm run build` ✅

### Set Environment Variables on Vercel

Click **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://tanglaw-api.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[YOUR-REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key (Settings → API) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` or use any random 32+ char string |
| `NEXTAUTH_URL` | `https://tanglaw-project.vercel.app` in production (`http://localhost:3000` locally) |
| `DATABASE_URL` | Same Supabase connection string from Step 1 |
| `GOOGLE_CLIENT_ID` | Google Web OAuth client ID (server-only) |
| `GOOGLE_CLIENT_SECRET` | Google Web OAuth client secret (server-only) |
| `AZURE_AD_CLIENT_ID` | Microsoft Entra application (client) ID (server-only) |
| `AZURE_AD_CLIENT_SECRET` | Microsoft Entra client secret value (server-only) |
| `AZURE_AD_TENANT_ID` | `common` |
| `OAUTH_BRIDGE_SECRET` | Exactly the same value as Render; server-only |
| `GOOGLE_API_KEY` | (Optional) For Gemini fallback — skip if using OpenRouter only |
| `GROQ_API_KEY` | (Optional) For Groq fallback — skip if using OpenRouter only |

`OAUTH_BRIDGE_SECRET` must match on Render and Vercel, but must not be reused as `NEXTAUTH_SECRET`, `JWT_SECRET`, or `GOOGLE_API_KEY`. `GOOGLE_API_KEY` is the unrelated Gemini key. Never use it as the Google OAuth client secret or as the bridge secret.

8. Click **Deploy**
9. Wait ~2-3 minutes for the build

### Update the Backend's CORS

Once Vercel gives you the stable URL `https://tanglaw-project.vercel.app`:

1. Go back to **Render Dashboard → tanglaw-api → Environment**
2. Update `FRONTEND_URL` to `https://tanglaw-project.vercel.app`
3. Click **Save Changes** → **Manual Deploy → Deploy latest commit**

---

## Step 4a — Configure Google and Microsoft sign-in

Create one Google Web OAuth client with an External audience and one Microsoft Entra Web app configured for personal plus work/school accounts. Use `common` as the Microsoft tenant. Register only these callback URLs:

```text
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/azure-ad
https://tanglaw-project.vercel.app/api/auth/callback/google
https://tanglaw-project.vercel.app/api/auth/callback/azure-ad
```

The app requests only `openid email profile`, forces `select_account`, and does not store provider access or refresh tokens. Microsoft sign-in requires an actual `email` claim; `preferred_username` is never used as a substitute. Preview Vercel domains are not supported in v1.

Before the first production deploy, inspect the Prisma diff against the production database:

```bash
cd backend
npx prisma migrate diff --from-url "$DIRECT_URL" --to-schema-datamodel prisma/schema.prisma
```

Stop if the diff contains a drop or data rewrite. The expected auth diff is two nullable `User` columns and one unique composite index. Render startup refuses destructive `db push` confirmation.

Deploy the backend schema and `/api/auth/oauth/exchange` first. Configure provider credentials and the matching bridge secret on Vercel, then deploy the frontend. If rollback is needed, roll back the frontend first and keep the additive backend fields and endpoint.

Release check: `https://tanglaw-project.vercel.app/api/auth/providers` must list `credentials`, `google`, and `azure-ad`.

---

## Step 5 — Keep Backend Warm for Free (Optional)

Render's free service sleeps after 15 minutes of inactivity. To prevent this, use a free uptime monitor:

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free, no card needed)
3. Click **Add New Monitor**
4. Set:
   - **Type**: HTTP(s)
   - **Name**: Tanglaw Backend
   - **URL**: `https://tanglaw-api.onrender.com/api/health`
   - **Interval**: 5 minutes
5. Click **Create Monitor**

This pings your backend every 5 minutes, preventing it from sleeping. The 750 free instance hours on Render are enough to cover 24/7 uptime.

---

## Step 6 — Seed the Database (Automated on Render Deploy)

The database schema and seed data are applied **automatically every time Render deploys** — no manual steps needed.

When you push to `main`, Render:
1. ✅ Builds the backend
2. ✅ Runs `backend/start.sh` which:
   - Pushes the Prisma schema (`prisma db push`)
   - Seeds scholarship data (`prisma/seed.ts`)
   - Starts the server

> **Important:** Render's free plan uses IPv4 by default. Your `DATABASE_URL` must be the **connection pooler** URL (port 6543) from Supabase — see Step 3 for setup instructions. The `DIRECT_URL` (port 5432) is only used by `prisma db push` and is set separately.

> **Note on vector store (ingest-memory.ts):** The RAG vector store (`vector_store.json`) is already committed to git, so it doesn't need to regenerate on every deploy. Only run `ingest-memory.ts` **locally** when you add new PDF documents to `backend/data/`, then commit the updated `vector_store.json`:
> ```bash
> cd backend
> npx tsx scripts/ingest-memory.ts
> git add data/vector_store.json && git commit -m "update vector store"
> ```

---

## Done! 🎉

Your stack:

| Layer | URL | Cost |
|-------|-----|------|
| **Frontend** | `https://tanglaw-project.vercel.app` | **$0** |
| **Backend** | `https://tanglaw-api.onrender.com` | **$0** |
| **Database** | Supabase PostgreSQL (Singapore) | **$0** |
| **LLM** | OpenRouter (free models) | **$0** |

**Total: $0/month — no credit card required for Vercel or Render.**

---

## Troubleshooting

**Backend deploy fails on Render**
→ Check environment variables are set correctly (especially `DATABASE_URL` and `JWT_SECRET`)

**Frontend build fails on Vercel — Prisma error**
→ Make sure `DATABASE_URL` is set in Vercel environment variables. Run `prisma generate` needs database access.

**Chatbot returns errors**
→ Check `OPENROUTER_API_KEY` is set on Render. Verify the free models are available.

**CORS errors in browser**
→ Confirm `FRONTEND_URL` on Render matches your Vercel URL exactly (no trailing slash)
