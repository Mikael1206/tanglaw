import { Pool } from "pg";
import { randomUUID } from "crypto";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

// @ts-expect-error `family` is valid at runtime but missing from @types/pg v8.20.0 PoolConfig
const pool = connectionString ? new Pool({ connectionString, family: 4 }) : null;

export type DatabaseUser = {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  emailVerified?: boolean;
  authProvider?: string | null;
  authProviderAccountId?: string | null;
};

const userColumns = `
  id,
  email,
  name,
  "passwordHash",
  "emailVerified",
  "authProvider",
  "authProviderAccountId"
`;

export async function getUserByEmail(email: string) {
  if (!pool) {
    throw new Error("DATABASE_URL or DIRECT_URL is required to query the Supabase user table.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT ${userColumns} FROM "User" WHERE LOWER(email) = $1 LIMIT 1`,
    [normalizedEmail]
  );

  return result.rows[0] ?? null;
}

export async function getUserById(id: string) {
  if (!pool) {
    throw new Error("DATABASE_URL or DIRECT_URL is required to query the Supabase user table.");
  }

  const result = await pool.query(
    `SELECT ${userColumns} FROM "User" WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function createUserRecord(input: { email: string; name: string; passwordHash: string }) {
  if (!pool) {
    throw new Error("DATABASE_URL or DIRECT_URL is required to create a Supabase user record.");
  }

  const result = await pool.query(
    'INSERT INTO "User" (id, email, name, "passwordHash", "emailVerified", "createdAt") VALUES ($1, $2, $3, $4, false, NOW()) RETURNING id, email, name',
    [randomUUID(), input.email, input.name, input.passwordHash]
  );

  return result.rows[0] ?? null;
}

export class OAuthEmailConflictError extends Error {
  readonly code = "OAUTH_EMAIL_CONFLICT";

  constructor() {
    super("An account already exists for this email.");
    this.name = "OAuthEmailConflictError";
  }
}

export type OAuthIdentityInput = {
  provider: "google" | "azure-ad";
  providerAccountId: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
};

function isUniqueViolation(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

/**
 * Find or create one provider-bound user. The provider identity is rechecked
 * when a concurrent commit appears between the two reads, and unique
 * constraints handle the remaining race with one retry.
 */
export async function findOrCreateOAuthUser(input: OAuthIdentityInput): Promise<DatabaseUser> {
  if (!pool) {
    throw new Error("DATABASE_URL or DIRECT_URL is required to query the Supabase user table.");
  }

  const normalizedInput = {
    ...input,
    email: input.email.trim().toLowerCase(),
    providerAccountId: input.providerAccountId.trim(),
    name: input.name?.trim() || null,
  };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const byProvider = await client.query<DatabaseUser>(
        `SELECT ${userColumns}
         FROM "User"
         WHERE "authProvider" = $1 AND "authProviderAccountId" = $2
         LIMIT 1
         FOR UPDATE`,
        [normalizedInput.provider, normalizedInput.providerAccountId]
      );

      if (byProvider.rows[0]) {
        await client.query("COMMIT");
        return byProvider.rows[0];
      }

      const byEmail = await client.query<DatabaseUser>(
        `SELECT ${userColumns} FROM "User" WHERE LOWER(email) = $1 LIMIT 1 FOR UPDATE`,
        [normalizedInput.email]
      );

      if (byEmail.rows[0]) {
        const existing = byEmail.rows[0];
        if (
          existing.authProvider === normalizedInput.provider &&
          existing.authProviderAccountId === normalizedInput.providerAccountId
        ) {
          await client.query("COMMIT");
          return existing;
        }
        throw new OAuthEmailConflictError();
      }

      const inserted = await client.query<DatabaseUser>(
        `INSERT INTO "User"
          (id, email, name, "passwordHash", "emailVerified", "authProvider", "authProviderAccountId", "createdAt")
         VALUES ($1, $2, $3, NULL, $4, $5, $6, NOW())
         RETURNING ${userColumns}`,
        [
          randomUUID(),
          normalizedInput.email,
          normalizedInput.name,
          normalizedInput.emailVerified,
          normalizedInput.provider,
          normalizedInput.providerAccountId,
        ]
      );

      await client.query("COMMIT");
      return inserted.rows[0];
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      if (isUniqueViolation(error) && attempt === 0) {
        continue;
      }
      throw error;
    } finally {
      client.release();
    }
  }

  throw new Error("Unable to provision OAuth account.");
}
