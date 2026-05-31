import { Request, Response } from "express";
import prisma from "../services/prismaClient";

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
};

/**
 * Controller for chat persistence endpoints.
 * Allows the frontend to store and retrieve chat messages for authenticated users.
 */
export const createMessage = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;
  const { role, content, metadata } = req.body;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!role || !content) {
    return res.status(400).json({ error: "role and content are required" });
  }

  try {
    const msg = await prisma.message.create({
      data: {
        userId: user.id,
        role,
        content,
        metadata,
      },
    });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
};

export const getMessagesForUser = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;
  const { userId } = req.params;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (userId && userId !== user.id) {
    return res.status(403).json({ error: "Forbidden: user mismatch" });
  }

  try {
    const msgs = await prisma.message.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
};
