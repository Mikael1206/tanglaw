import { Router } from "express";
import { getScholarships } from "../controllers/scholarshipController";
import { createMessage, getMessagesForUser, chatWithOwel } from "../controllers/chatController";
import { signup, login, me, logout } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

/**
 * API router for backend endpoints used by the Tanglaw frontend.
 * Includes health, auth, scholarship, and message persistence routes.
 */

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.post("/auth/logout", authenticateToken, logout);
router.get("/auth/me", authenticateToken, me);

router.get("/scholarships", authenticateToken, getScholarships);

// AI chat endpoint
router.post("/chat", authenticateToken, chatWithOwel);

// Chat message routes
router.post("/messages", authenticateToken, createMessage);
router.get("/messages", authenticateToken, getMessagesForUser);
router.get("/messages/:userId", authenticateToken, getMessagesForUser);

export default router;
