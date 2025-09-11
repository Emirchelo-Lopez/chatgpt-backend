import { Router } from "express";
import { checkSchema, validationResult, matchedData } from "express-validator";
import { User } from "../models/User.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  sanitizeUser,
} from "../utils/helpers.js";
import {
  registerValidationSchema,
  loginValidationSchema,
} from "../utils/validationSchemas.js";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  checkSchema(registerValidationSchema),
  async (req, res) => {
    try {
      // Check validation results
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.array(),
        });
      }

      const data = matchedData(req);

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ username: data.username }, { email: data.email }],
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this username or email already exists",
        });
      }

      // Hash password
      data.password = hashPassword(data.password);

      // Create new user
      const newUser = new User(data);
      const savedUser = await newUser.save();

      // Generate token
      const token = generateToken({
        userId: savedUser._id,
        username: savedUser.username,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          token,
          user: sanitizeUser(savedUser),
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// POST /api/auth/login
router.post("/login", checkSchema(loginValidationSchema), async (req, res) => {
  try {
    // Check validation results
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.array(),
      });
    }

    const { username, password } = matchedData(req);

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Compare password
    const isMatch = comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken({
      userId: user._id,
      username: user.username,
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
