// src/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import colors from "colors";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
      "https://chatgpt-clone-eight-cyan.vercel.app",
      "https://*.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`.cyan);
  next();
});

// Routes
app.use(routes);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON format",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Connect to MongoDB ONCE on startup
const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...".yellow);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Timeout settings
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 75000, // 75 seconds
      connectTimeoutMS: 30000, // 30 seconds

      // Connection pooling
      maxPoolSize: 10,
      minPoolSize: 5,

      // Retry settings
      retryWrites: true,

      // Write concern
      w: "majority",

      // Remove these deprecated options:
      // bufferMaxEntries: 0,     ❌ REMOVE
      // bufferCommands: false,   ❌ REMOVE
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.green.bold);
    console.log(`📁 Database: ${conn.connection.name}`.green);

    // Test the connection immediately
    await conn.connection.db.admin().ping();
    console.log("🏓 MongoDB ping successful".green);
  } catch (error) {
    console.error(`❌ MongoDB connection failed:`.red.bold);
    console.error(`Error: ${error.message}`.red);
    console.error(`Stack: ${error.stack}`.red);

    // Exit the process if we can't connect to the database
    process.exit(1);
  }
};

// app.use(async (req, res, next) => {
//   try {
//     await connectDB();
//     next();
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Database connection failed",
//     });
//   }
// });

// Connect to database on startup
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`.yellow.bold);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

// Export the Express API for Vercel
export default app;
