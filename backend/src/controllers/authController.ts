import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "crypto";
import {
  createUserRecord,
  findOrCreateOAuthUser,
  getUserByEmail,
  OAuthEmailConflictError,
} from "../services/supabaseUserDb";
import { AuthenticatedUser, createAuthToken } from "../services/authToken";

const isValidEmail = (value: unknown): value is string => {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isValidPassword = (value: unknown): value is string => {
  return typeof value === "string" && value.length >= 8;
};

const isObjectBody = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

const oauthFields = new Set(["provider", "providerAccountId", "email", "name", "emailVerified"]);

const isOAuthProvider = (value: unknown): value is "google" | "azure-ad" => {
  return value === "google" || value === "azure-ad";
};

const isValidProviderAccountId = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 512;
};

const bridgeSecretMatches = (req: Request): boolean => {
  const expectedSecret = process.env.OAUTH_BRIDGE_SECRET;
  const authorization = req.headers.authorization;
  const providedSecret = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  if (!expectedSecret || !expectedSecret.trim() || !providedSecret) return false;

  const expected = createHash("sha256").update(expectedSecret).digest();
  const provided = createHash("sha256").update(providedSecret).digest();
  return timingSafeEqual(expected, provided);
};

const publicUser = (user: AuthenticatedUser) => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

export const signup = async (req: Request, res: Response) => {
  const body = isObjectBody(req.body) ? req.body : {};
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = body.password;

  if (!fullName || !isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ error: "Full name, valid email, and password are required." });
  }

  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUserRecord({ email, name: fullName, passwordHash });
    if (!user) {
      return res.status(500).json({ error: "Unable to create account." });
    }

    const issued = createAuthToken(user);

    res.json({
      ...issued,
      user: publicUser(user),
    });
  } catch {
    console.error("Signup failed", { result: "ERROR" });
    res.status(500).json({ error: "Unable to create account." });
  }
};

export const login = async (req: Request, res: Response) => {
  const body = isObjectBody(req.body) ? req.body : {};
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = body.password;

  if (!isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ error: "Valid email and password are required." });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const issued = createAuthToken(user);

    res.json({
      ...issued,
      user: publicUser(user),
    });
  } catch {
    console.error("Login failed", { result: "ERROR" });
    res.status(500).json({ error: "Unable to sign in." });
  }
};

export const oauthExchange = async (req: Request, res: Response) => {
  if (!process.env.OAUTH_BRIDGE_SECRET?.trim()) {
    console.error("OAuth bridge is not configured.");
    return res.status(503).json({ error: "Social sign-in is temporarily unavailable.", code: "OAUTH_UNAVAILABLE" });
  }

  if (!bridgeSecretMatches(req)) {
    return res.status(401).json({ error: "Invalid OAuth bridge credentials.", code: "OAUTH_BRIDGE_UNAUTHORIZED" });
  }

  const body = req.body;
  if (!isObjectBody(body)) {
    return res.status(400).json({ error: "A valid social identity is required.", code: "OAUTH_INVALID_IDENTITY" });
  }

  if (Object.keys(body).some((key) => !oauthFields.has(key))) {
    return res.status(400).json({ error: "A valid social identity is required.", code: "OAUTH_INVALID_IDENTITY" });
  }

  const provider = body.provider;
  const providerAccountId = typeof body.providerAccountId === "string" ? body.providerAccountId.trim() : "";
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const rawName = body.name;
  const rawEmailVerified = body.emailVerified;
  const hasInvalidName = rawName !== undefined && rawName !== null && typeof rawName !== "string";
  const name = typeof rawName === "string" ? rawName.trim() || null : null;
  const emailVerified = rawEmailVerified === undefined ? false : rawEmailVerified;

  if (
    !isOAuthProvider(provider) ||
    !isValidProviderAccountId(providerAccountId) ||
    !isValidEmail(email) ||
    hasInvalidName ||
    typeof emailVerified !== "boolean"
  ) {
    return res.status(400).json({ error: "A valid social identity is required.", code: "OAUTH_INVALID_IDENTITY" });
  }

  if (provider === "google" && !emailVerified) {
    return res.status(400).json({ error: "A verified Google email is required.", code: "OAUTH_EMAIL_UNVERIFIED" });
  }

  try {
    const user = await findOrCreateOAuthUser({
      provider,
      providerAccountId,
      email,
      name,
      emailVerified,
    });
    const issued = createAuthToken(user);

    return res.json({
      ...issued,
      user: publicUser(user),
    });
  } catch (error) {
    if (error instanceof OAuthEmailConflictError) {
      return res.status(409).json({
        error: "An account already exists for this email. Sign in with its original method.",
        code: error.code,
      });
    }

    console.error("OAuth exchange failed", { provider });
    return res.status(503).json({ error: "Social sign-in is temporarily unavailable.", code: "OAUTH_UNAVAILABLE" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.json({ success: true });
};

export const me = async (req: Request, res: Response) => {
  const authReq = req as Request & { user?: AuthenticatedUser };
  const user = authReq.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ user });
};
