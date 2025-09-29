import { Router } from "express";
import { auth } from "../middleware/auth.js";

const router = Router();

// AI Chat endpoint
router.post("/generate", auth, async (req, res) => {
  try {
    const { message, history } = req.body;

    // Call Gemini API from backend
    const GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

    const conversation =
      history && history.length > 0
        ? history
        : [{ role: "user", parts: [{ text: message }] }];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: conversation }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP request failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    const botMessage = data.candidates[0].content.parts[0].text;

    res.json({
      success: true,
      response: botMessage,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate response",
    });
  }
});

export default router;
