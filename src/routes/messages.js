import { Router } from "express";
import { checkSchema, validationResult, matchedData } from "express-validator";
import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import { auth } from "../middleware/auth.js";
import { messageValidationSchema } from "../utils/validationSchemas.js";
import { generateChatTitle } from "../utils/helpers.js";

const router = Router();

// All routes require authentication
router.use(auth);

// POST /api/messages - Add message to conversation
router.post("/", checkSchema(messageValidationSchema), async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.array(),
      });
    }

    const data = matchedData(req);
    const { conversationId } = req.body;

    // Verify conversation exists and belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Create new message
    const newMessage = new Message({
      ...data,
      conversationId,
      userId: req.user.userId,
    });

    const savedMessage = await newMessage.save();

    // Update conversation title if this is the first user message
    if (data.role === "user" && conversation.messageCount === 0) {
      conversation.title = generateChatTitle(data.content);
    }

    // Update conversation stats
    conversation.messageCount += 1;
    conversation.lastActivity = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      message: "Message added successfully",
      data: {
        message: savedMessage,
      },
    });
  } catch (error) {
    console.error("Add message error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/messages/:conversationId - Get messages for conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      conversationId: req.params.conversationId,
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: skip + messages.length < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PUT /api/messages/:id - Edit message
router.put("/:id", checkSchema(messageValidationSchema), async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.array(),
      });
    }

    const data = matchedData(req);

    // Find message and verify ownership
    const message = await Message.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Update message
    message.content = data.content;
    message.isEdited = true;
    message.editedAt = new Date();

    const updatedMessage = await message.save();

    res.json({
      success: true,
      message: "Message updated successfully",
      data: {
        message: updatedMessage,
      },
    });
  } catch (error) {
    console.error("Update message error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// DELETE /api/messages/:id - Delete message
router.delete("/:id", async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Update conversation message count
    await Conversation.findByIdAndUpdate(message.conversationId, {
      $inc: { messageCount: -1 },
      lastActivity: new Date(),
    });

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
