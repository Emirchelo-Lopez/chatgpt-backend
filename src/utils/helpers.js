import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Hash password with bcrypt
export const hashPassword = (password) => {
  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 12;
  return bcrypt.hashSync(password, saltRounds);
};

// Compare password with hashed password
export const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate chat title from first message
export const generateChatTitle = (firstMessage) => {
  if (!firstMessage) return "New Chat";

  // Take first 50 characters and add ellipsis if longer
  const title =
    firstMessage.length > 50
      ? firstMessage.substring(0, 50) + "..."
      : firstMessage;

  return title;
};

// Sanitize user object for response (remove password)
export const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user.toObject();
  return sanitizedUser;
};
