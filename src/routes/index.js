import { Router } from "express";
import mongoose from "mongoose";
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

// Debug connection endpoint
router.get("/debug-connection", async (req, res) => {
  console.log("=== CONNECTION DEBUG ===");
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
  console.log(
    "MONGO_URI preview:",
    process.env.MONGO_URI
      ? process.env.MONGO_URI.substring(0, 50) + "..."
      : "Not found"
  );
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Mongoose connection state:", mongoose.connection.readyState);
  console.log("Mongoose connection host:", mongoose.connection.host);
  console.log("Mongoose connection name:", mongoose.connection.name);

  // Connection states:
  // 0 = disconnected
  // 1 = connected
  // 2 = connecting
  // 3 = disconnecting

  const connectionStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  try {
    // Try a simple database operation
    const adminResult = await mongoose.connection.db.admin().ping();

    res.json({
      success: true,
      connectionState: mongoose.connection.readyState,
      connectionStateName: connectionStates[mongoose.connection.readyState],
      host: mongoose.connection.host,
      databaseName: mongoose.connection.name,
      ping: adminResult,
      mongoUriExists: !!process.env.MONGO_URI,
      message: "MongoDB connection is working",
    });
  } catch (error) {
    console.error("Connection test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      connectionState: mongoose.connection.readyState,
      connectionStateName: connectionStates[mongoose.connection.readyState],
      host: mongoose.connection.host,
      databaseName: mongoose.connection.name,
      mongoUriExists: !!process.env.MONGO_URI,
    });
  }
});

// Route to debug the connection string format
router.get("/debug-uri", (req, res) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    return res.json({
      success: false,
      error: "MONGO_URI not found",
    });
  }

  // Parse the URI to check its components
  const parts = uri.split("/");
  const hasDatabase = parts.length > 3 && parts[3] && !parts[3].startsWith("?");

  // Hide password for security
  const safeUri = uri.replace(/:([^:@]+)@/, ":****@");

  res.json({
    success: true,
    connectionString: safeUri,
    hasDatabaseName: hasDatabase,
    databasePart: hasDatabase ? parts[3].split("?")[0] : "MISSING",
    format: hasDatabase ? "CORRECT" : "INCORRECT - Missing database name",
    advice: hasDatabase
      ? "URI format looks good"
      : "Add database name: /your-db-name before the ?",
  });
});

export default router;
