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
      "http://localhost:5173", // Vite default port
      "http://localhost:3000", // React default port (keep this)
      process.env.FRONTEND_URL,
      "https://*.vercel.app",
    ],
    credentials: true,
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

// Database connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.green.bold);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`.red.bold);
    throw error;
  }
};

// Connect to database on each request (serverless pattern)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`.yellow.bold);
  });
}

// Graceful shutdown
// process.on("SIGTERM", () => {
//   console.log("SIGTERM received. Shutting down gracefully...");
//   mongoose.connection.close(() => {
//     console.log("MongoDB connection closed.");
//     process.exit(0);
//   });
// });

// Export the Express API for Vercel
export default app;
