---
name: context7
description: Upstash Context7 integration — fetches live, version-specific documentation for any library/framework and injects it directly into the agent's context. Prevents hallucinated APIs by replacing stale training data with current docs.
license: MIT
metadata:
  author: Upstash
  version: "1.0.0"
---

# Context7 — Live Documentation for AI Agents

This skill integrates **Upstash Context7** into the Codebuff workflow. Context7 fetches up-to-date, version-specific documentation and code examples straight from the source, placing them directly into the agent's prompt context.

## Why This Matters

This project uses very recent framework versions:
- **Next.js 16** (App Router)
- **React 19**
- **Prisma 7** (with `@prisma/adapter-pg`)
- **Tailwind CSS v4** (with `@tailwindcss/postcss` plugin)

AI training data may predate API changes in these versions. Context7 solves this by pulling live docs.

## How to Use

### Step 1: Resolve a library to its Context7 ID

```bash
npx ctx7 library <library-name> "<what-you-want-to-do>"
```

Examples:
```bash
npx ctx7 library prisma "How to define one-to-many relations with cascade delete"
npx ctx7 library nextjs "How to set up app router with middleware"
npx ctx7 library react "How to clean up useEffect with async operations"
```

### Step 2: Fetch documentation

Use the Library ID from Step 1 to fetch live documentation:

```bash
npx ctx7 docs <library-id> "<specific-question>"
```

Examples:
```bash
npx ctx7 docs /prisma/web "How to use @prisma/adapter-pg with connection pooling"
npx ctx7 docs /vercel/next.js "How to use React cache() for SSR deduplication"
npx ctx7 docs /facebook/react "How to use useActionState in React 19"
npx ctx7 docs /tailwindlabs/tailwindcss "How to set up v4 with @tailwindcss/postcss"
```

## Version-Specific Queries

When you know the exact version, specify it for more precise results:

```bash
npx ctx7 docs /vercel/next.js/v16.0.0 "How to configure Turbopack"
npx ctx7 docs /facebook/react/v19.0.0 "How to use Server Components"
```

## Output JSON (for scripting)

Both `ctx7 library` and `ctx7 docs` support `--json` flag for structured output:

```bash
npx ctx7 library prisma "relations" --json
npx ctx7 docs /prisma/web "cascade delete" --json
```

## When to Always Use Context7

**ALWAYS** use Context7 before writing code that involves:
- Framework APIs (Next.js route handlers, layouts, metadata, middleware)
- ORM queries (Prisma relations, raw queries, connection pooling, migrations)
- UI libraries (Tailwind CSS v4, Framer Motion, lucide-react)
- React hooks and patterns (`useActionState`, `useOptimistic`, Server Components, `cache()`)
- Database (PostgreSQL, Supabase, pg.Pool)
- Package configuration (`next.config.mjs`, `postcss.config.mjs`, `tsconfig.json`)

## Verification

After writing code using Context7 docs, cross-reference with the project's existing patterns to ensure consistency. The goal is **correctness + consistency** — use live docs for API accuracy, but match the existing project's style and conventions.
