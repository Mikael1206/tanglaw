#!/usr/bin/env bash
# Tanglaw Backend — Startup Script
# Runs on every Render deploy to ensure the database schema and seed data
# are always up to date before the server starts.
#
# Dependencies are already installed by Render's build phase.
# Render supports IPv6, so this works with Supabase IPv6-only databases.

echo "=== Tanglaw Backend Startup ==="
date -u

echo "[1/4] Generating Prisma client..."
if ! npx prisma generate 2>&1; then
  echo "❌ Prisma generate failed — cannot continue without database client."
  exit 1
fi

echo "[2/4] Pushing database schema..."
if ! npx prisma db push 2>&1; then
  echo "❌ Schema push failed — cannot continue without database schema."
  exit 1
fi

echo "[3/4] Seeding scholarship data..."
if ! npx ts-node --transpile-only prisma/seed.ts 2>&1; then
  echo "❌ Seeding failed — scholarships will not be available."
  exit 1
fi

echo "[4/4] Seeding question bank..."
if ! npx ts-node --transpile-only prisma/seed-questions.ts 2>&1; then
  echo "⚠️ Question seeding failed — mock exams and diagnostics will not be available."
  # Do NOT exit 1 here; the server should still start even if question seeding fails.
fi

echo "=== Starting server ==="
exec node dist/server.js
