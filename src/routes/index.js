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

// Just for debugging (remove after fixing)
router.get("/debug", (req, res) => {
  res.json({
    success: true,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI_EXISTS: !!process.env.MONGO_URI,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
      SALT_ROUNDS: process.env.SALT_ROUNDS,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    },
  });
});

export default router;
