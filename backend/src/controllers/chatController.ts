import { Request, Response } from "express";
import prisma from "../services/prismaClient";
import { generateChatResponse } from "../services/chatService";
import type { AuthenticatedRequest } from "../middleware/auth";

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

/**
 * AI-powered chat endpoint that uses the RAG pipeline
 * (Gemini 3.1 Flash-Lite → OpenRouter fallbacks) to generate
 * a contextual response based on the user's question.
 */
export const chatWithOwel = async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user;
  const { question } = req.body;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({ error: "question (string) is required" });
  }

  try {
    // Use the user's ID as the session key so conversation history persists
    const answer = await generateChatResponse(question.trim(), user.id);
    res.json({ answer });
  } catch (err) {
    console.error("[chatWithOwel] Error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to generate chat response",
    });
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
