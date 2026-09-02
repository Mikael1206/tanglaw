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

/** Daily AI chat limit per user (free tier protection). */
const DAILY_AI_LIMIT = 3;

/**
 * AI-powered chat endpoint that uses the RAG pipeline
 * (Gemini 3.1 Flash-Lite → OpenRouter fallbacks) to generate
 * a contextual response based on the user's question.
 *
 * Enforces a daily limit of 3 AI-generated messages per user
 * to protect free tier API rate limits. Preloaded/hardcoded
 * quick questions on the frontend are NOT counted here.
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
    // ── Daily usage limit (3 AI queries per day) ────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const aiMessageCount = await prisma.message.count({
      where: {
        userId: user.id,
        createdAt: { gte: today },
        metadata: { path: ["source"], equals: "ai-rag" },
      },
    });

    if (aiMessageCount >= DAILY_AI_LIMIT) {
      console.log(`[chatWithOwel] Daily limit reached for user ${user.id} (${aiMessageCount}/${DAILY_AI_LIMIT})`);
      return res.json({
        answer: `Hoot! You've reached your daily AI chat limit of ${DAILY_AI_LIMIT} queries. This helps us keep TANGLAW free for everyone. You can still use the Quick Questions above, or come back tomorrow — I'll be here! 🦉`,
        code: "DAILY_LIMIT",
        remaining: 0,
        limit: DAILY_AI_LIMIT,
      });
    }

    // Use the user's ID as the session key so conversation history persists
    const answer = await generateChatResponse(question.trim(), user.id);

    res.json({
      answer,
      remaining: DAILY_AI_LIMIT - (aiMessageCount + 1),
      limit: DAILY_AI_LIMIT,
    });
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
