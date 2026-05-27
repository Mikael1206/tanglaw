import { Request, Response } from "express";
import { generateChatResponse } from "../services/chatService";

export const chat = async (req: Request, res: Response) => {
  try {
    const { question, session_id } = req.body;

    if (!question || !session_id) {
      return res.status(400).json({ error: "question and session_id are required." });
    }

    const answer = await generateChatResponse(question, session_id);
    
    return res.json({ answer });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Owel RAG] Error:", error);
    return res.status(500).json({ error: message });
  }
};
