import { Router } from "express";
import authRoutes from "./auth.js";
import conversationRoutes from "./conversations.js";
import messageRoutes from "./messages.js";
import chatRoutes from "./chat.js";

const router = Router();

// API Routes
router.use("/api/auth", authRoutes);
router.use("/api/conversations", conversationRoutes);
router.use("/api/messages", messageRoutes);
router.use("/api/chat", chatRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "ChatGPT Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
