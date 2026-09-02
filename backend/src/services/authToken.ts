import jwt from "jsonwebtoken";

export const APP_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error("Missing JWT_SECRET environment variable. This is required for API session security.");
  }
  return secret;
}

export type AuthenticatedUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type VerifiedTokenPayload = {
  userId: string;
  email: string;
  name?: string | null;
};

export type IssuedAuthToken = {
  token: string;
  tokenExpiresAt: number;
};

export function createAuthToken(user: AuthenticatedUser): IssuedAuthToken {
  const issuedAt = Math.floor(Date.now() / 1000);
  const tokenExpiresAt = issuedAt + APP_SESSION_TTL_SECONDS;
  const token = jwt.sign(
    { userId: user.id, email: user.email, name: user.name, iat: issuedAt, exp: tokenExpiresAt },
    getJwtSecret()
  );

  return { token, tokenExpiresAt };
}

export function verifyAuthToken(token: string): VerifiedTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.userId !== "string" ||
    typeof decoded.email !== "string" ||
    typeof decoded.iat !== "number" ||
    typeof decoded.exp !== "number" ||
    decoded.exp - decoded.iat !== APP_SESSION_TTL_SECONDS
  ) {
    throw new Error("Invalid authentication token claims.");
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
    name: typeof decoded.name === "string" ? decoded.name : decoded.name === null ? null : undefined,
  };
}
