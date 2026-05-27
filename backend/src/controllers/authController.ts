import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../services/prismaClient";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "2h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

type AuthenticatedUser = {
  id: string;
  email: string;
  name?: string | null;
};

const createToken = (user: AuthenticatedUser) => {
  return jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const isValidEmail = (value: unknown): value is string => {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isValidPassword = (value: unknown): value is string => {
  return typeof value === "string" && value.length >= 8;
};

export const signup = async (req: Request, res: Response) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").toLowerCase().trim();
  const password = req.body.password;

  if (!fullName || !isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ error: "Full name, valid email, and password are required." });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        passwordHash,
        emailVerified: false,
      },
    });

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Unable to create account." });
  }
};

export const login = async (req: Request, res: Response) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const password = req.body.password;

  if (!isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ error: "Valid email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Unable to sign in." });
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
