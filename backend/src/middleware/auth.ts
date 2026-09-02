import { NextFunction, Request, Response } from "express";
import { getUserById } from "../services/supabaseUserDb";
import { verifyAuthToken } from "../services/authToken";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
};

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const payload = verifyAuthToken(token);
    const user = await getUserById(payload.userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid token user" });
    }

    const authReq = req as AuthenticatedRequest;
    authReq.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
