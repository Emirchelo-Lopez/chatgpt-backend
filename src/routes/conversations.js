import { Router } from "express";
import { checkSchema, validationResult, matchedData } from "express-validator";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { auth } from "../middleware/auth.js";
import { conversationValidationSchema } from "../utils/validationSchemas.js";
import { generateChatTitle } from "../utils/helpers.js";

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/conversations - Get all conversations for logged-in user
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, archived = false } = req.query;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      userId: req.user.userId,
      isArchived: archived === "true",
    })
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "username firstName lastName");

    const total = await Conversation.countDocuments({
      userId: req.user.userId,
      isArchived: archived === "true",
    });

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: skip + conversations.length < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/conversations/:id - Get single conversation with messages
router.get("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Get messages for this conversation
    const messages = await Message.find({
      conversationId: req.params.id,
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/conversations - Create new conversation
router.post(
  "/",
  checkSchema(conversationValidationSchema),
  async (req, res) => {
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

      const newConversation = new Conversation({
        ...data,
        userId: req.user.userId,
        title: data.title || "New Chat",
      });

      const savedConversation = await newConversation.save();

      res.status(201).json({
        success: true,
        message: "Conversation created successfully",
        data: {
          conversation: savedConversation,
        },
      });
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// PUT /api/conversations/:id - Update conversation
router.put(
  "/:id",
  checkSchema(conversationValidationSchema),
  async (req, res) => {
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

      const conversation = await Conversation.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user.userId,
        },
        {
          ...data,
          lastActivity: new Date(),
        },
        { new: true }
      );

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      res.json({
        success: true,
        message: "Conversation updated successfully",
        data: {
          conversation,
        },
      });
    } catch (error) {
      console.error("Update conversation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// DELETE /api/conversations/:id - Delete conversation
router.delete("/:id", async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Delete all messages in this conversation
    await Message.deleteMany({
      conversationId: req.params.id,
    });

    res.json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PATCH /api/conversations/:id/archive - Archive/unarchive conversation
router.patch("/:id/archive", async (req, res) => {
  try {
    const { archived = true } = req.body;

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      { isArchived: archived },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.json({
      success: true,
      message: `Conversation ${
        archived ? "archived" : "unarchived"
      } successfully`,
      data: {
        conversation,
      },
    });
  } catch (error) {
    console.error("Archive conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
