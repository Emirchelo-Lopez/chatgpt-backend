import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { GoogleGenAI } from "@google/genai";

const router = Router();

const ai = new GoogleGenAI({});

// AI Chat endpoint
router.post("/generate", auth, async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate input
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required and must be a string",
      });
    }

    // Build conversation context
    let contents;

    if (history && history.length > 0) {
      // Convert frontend history format to Gemini format
      // Frontend sends: [{ role: 'user'|'assistant', content: 'text' }]
      // Gemini expects: [{ role: 'user'|'model', parts: [{ text: 'text' }] }]
      const formattedHistory = history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.parts ? msg.parts[0].text : msg.content }],
      }));

      // Add current message
      contents = [
        ...formattedHistory,
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];
    } else {
      // First message in conversation
      contents = message;
    }

    // Generate AI response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    // Extract the text from response
    const botMessage = response.text;

    res.json({
      success: true,
      response: botMessage,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    // Handle specific error types
    let errorMessage = "Failed to generate response";
    let statusCode = 500;

    if (error.message?.includes("API key")) {
      errorMessage = "Invalid API key";
      statusCode = 401;
    } else if (error.message?.includes("quota")) {
      errorMessage = "API quota exceeded";
      statusCode = 429;
    } else if (error.message?.includes("model")) {
      errorMessage = "Invalid model specified";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
