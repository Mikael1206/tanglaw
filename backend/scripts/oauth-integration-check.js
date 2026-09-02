/*
 * Dependency-free (Node built-ins plus the backend's existing pg/jsonwebtoken)
 * smoke check for the OAuth bridge. Run after `npm run build` with a disposable
 * PostgreSQL database:
 *
 *   OAUTH_TEST_DATABASE_URL='postgresql://...' npm run test:oauth
 *
 * The script creates one temporary schema and removes it on exit. It refuses
 * to use DATABASE_URL so a production connection is not selected by accident.
 */
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { spawn } = require("node:child_process");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const databaseUrl = process.env.OAUTH_TEST_DATABASE_URL;
if (!databaseUrl) {
  console.log("OAuth integration check skipped: set OAUTH_TEST_DATABASE_URL to a disposable PostgreSQL database.");
  process.exit(0);
}

const schema = `oauth_check_${randomUUID().replace(/-/g, "")}`;
const port = 4300 + Math.floor(Math.random() * 300);
const bridgeSecret = `bridge-${randomUUID()}`;
const jwtSecret = `jwt-${randomUUID()}`;
const serverUrl = `http://127.0.0.1:${port}`;
const childEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  DIRECT_URL: databaseUrl,
  FRONTEND_URL: "http://127.0.0.1:3000",
  JWT_SECRET: jwtSecret,
  OAUTH_BRIDGE_SECRET: bridgeSecret,
  PORT: String(port),
  PGOPTIONS: `-c search_path=${schema},public`,
};

const pool = new Pool({ connectionString: databaseUrl });
let adminClient;
let server;
let serverOutput = "";

async function request(path, options = {}) {
  const response = await fetch(`${serverUrl}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => null);
  return { response, body };
}

async function waitForHealth() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const { response } = await request("/api/health");
      if (response.ok) return;
    } catch {
      // The child may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Backend did not start. Output:\n${serverOutput}`);
}

function jsonBody(value) {
  return { method: "POST", body: JSON.stringify(value) };
}

async function expectStatus(path, expectedStatus, options) {
  const result = await request(path, options);
  assert.equal(
    result.response.status,
    expectedStatus,
    `${path}: expected ${expectedStatus}, received ${result.response.status}`
  );
  return result.body;
}

async function main() {
  adminClient = await pool.connect();
  await adminClient.query(`CREATE SCHEMA "${schema}"`);
  await adminClient.query(`SET search_path TO "${schema}", public`);
  await adminClient.query(`
    CREATE TABLE "User" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT,
      "passwordHash" TEXT,
      "emailVerified" BOOLEAN NOT NULL DEFAULT false,
      "authProvider" TEXT,
      "authProviderAccountId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_authProvider_authProviderAccountId_key"
        UNIQUE ("authProvider", "authProviderAccountId")
    )
  `);

  server = spawn(process.execPath, ["dist/server.js"], {
    cwd: __dirname + "/..",
    env: childEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  await waitForHealth();

  const exchangeHeaders = { Authorization: `Bearer ${bridgeSecret}` };
  await expectStatus(
    "/api/auth/oauth/exchange",
    401,
    { ...jsonBody({ provider: "google", providerAccountId: "x", email: "x@example.com", emailVerified: true }), headers: { Authorization: "Bearer wrong" } }
  );
  await expectStatus(
    "/api/auth/oauth/exchange",
    400,
    { ...jsonBody({ provider: "google", providerAccountId: "x", email: "x@example.com", emailVerified: "true" }), headers: exchangeHeaders }
  );

  const firstGoogle = await expectStatus(
    "/api/auth/oauth/exchange",
    200,
    { ...jsonBody({ provider: "google", providerAccountId: "google-subject", email: "  Google.User+tag@Example.com ", name: "First Name", emailVerified: true }), headers: exchangeHeaders }
  );
  assert.equal(firstGoogle.user.email, "google.user+tag@example.com");
  assert.equal(firstGoogle.user.name, "First Name");
  assert.equal(typeof firstGoogle.token, "string");
  assert.equal(firstGoogle.tokenExpiresAt, jwt.decode(firstGoogle.token).exp);
  assert.equal(jwt.decode(firstGoogle.token).exp - jwt.decode(firstGoogle.token).iat, 7 * 24 * 60 * 60);

  const repeatGoogle = await expectStatus(
    "/api/auth/oauth/exchange",
    200,
    { ...jsonBody({ provider: "google", providerAccountId: "google-subject", email: "changed@example.com", name: "Changed Name", emailVerified: true }), headers: exchangeHeaders }
  );
  assert.equal(repeatGoogle.user.id, firstGoogle.user.id);
  assert.equal(repeatGoogle.user.email, firstGoogle.user.email);
  assert.equal(repeatGoogle.user.name, firstGoogle.user.name);

  await expectStatus(
    "/api/auth/oauth/exchange",
    409,
    { ...jsonBody({ provider: "azure-ad", providerAccountId: "same-email-microsoft", email: "google.user+tag@example.com" }), headers: exchangeHeaders }
  );

  await expectStatus(
    "/api/auth/oauth/exchange",
    400,
    { ...jsonBody({ provider: "google", providerAccountId: "unverified", email: "unverified@example.com", emailVerified: false }), headers: exchangeHeaders }
  );
  await expectStatus(
    "/api/auth/oauth/exchange",
    400,
    { ...jsonBody({ provider: "azure-ad", providerAccountId: "microsoft-no-email", preferred_username: "not-an-email" }), headers: exchangeHeaders }
  );

  const firstMicrosoft = await expectStatus(
    "/api/auth/oauth/exchange",
    200,
    { ...jsonBody({ provider: "azure-ad", providerAccountId: "microsoft-subject", email: "outlook@example.com", name: null }), headers: exchangeHeaders }
  );
  const me = await request("/api/auth/me", { headers: { Authorization: `Bearer ${firstMicrosoft.token}` } });
  assert.equal(me.response.status, 200);
  assert.equal(me.body.user.id, firstMicrosoft.user.id);

  const passwordUser = await expectStatus(
    "/api/auth/signup",
    200,
    jsonBody({ fullName: "Password User", email: "password@example.com", password: "Password123!" })
  );
  const passwordLogin = await expectStatus(
    "/api/auth/login",
    200,
    jsonBody({ email: "PASSWORD@example.com", password: "Password123!" })
  );
  assert.equal(passwordLogin.tokenExpiresAt, jwt.decode(passwordLogin.token).exp);
  assert.equal(jwt.decode(passwordLogin.token).exp - jwt.decode(passwordLogin.token).iat, 7 * 24 * 60 * 60);
  await expectStatus(
    "/api/auth/oauth/exchange",
    409,
    { ...jsonBody({ provider: "google", providerAccountId: "password-google", email: "PASSWORD@example.com", emailVerified: true }), headers: exchangeHeaders }
  );
  assert.equal(typeof passwordUser.tokenExpiresAt, "number");

  const concurrent = await Promise.all(
    Array.from({ length: 8 }, () => request("/api/auth/oauth/exchange", {
      ...jsonBody({ provider: "google", providerAccountId: "concurrent-subject", email: "concurrent@example.com", name: "Concurrent", emailVerified: true }),
      headers: exchangeHeaders,
    }))
  );
  assert.ok(concurrent.every(({ response }) => response.status === 200));
  assert.equal(new Set(concurrent.map(({ body }) => body.user.id)).size, 1);

  console.log("OAuth integration check passed: bridge auth, both providers, idempotency, collisions, concurrency, JWT expiry, and /auth/me.");
}

main()
  .catch((error) => {
    console.error("OAuth integration check failed:", error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (server) {
      if (server.exitCode === null && !server.killed) {
        server.kill("SIGTERM");
        await new Promise((resolve) => {
          const timer = setTimeout(resolve, 2_000);
          server.once("exit", () => {
            clearTimeout(timer);
            resolve();
          });
        });
      }
    }
    if (adminClient) {
      await adminClient.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`).catch(() => undefined);
      adminClient.release();
    }
    await pool.end();
  });
