import { verifyToken } from "../utils/helpers.js";

export const auth = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    // Extract the actual token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Add user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid token.",
    });
  }
};
