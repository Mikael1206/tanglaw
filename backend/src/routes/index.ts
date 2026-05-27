import { Router } from "express";
import { getScholarships } from "../controllers/scholarshipController";
import { chat } from "../controllers/chatController";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

router.get("/scholarships", getScholarships);
router.post("/chat", chat);

export default router;
