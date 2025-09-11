export const registerValidationSchema = {
  username: {
    isString: { errorMessage: "Username must be a string" },
    notEmpty: { errorMessage: "Username is required" },
    isLength: {
      options: { min: 3, max: 30 },
      errorMessage: "Username must be 3-30 characters",
    },
    matches: {
      options: /^[a-zA-Z0-9_]+$/,
      errorMessage:
        "Username can only contain letters, numbers, and underscores",
    },
  },
  email: {
    isEmail: { errorMessage: "Must be a valid email address" },
    normalizeEmail: true,
  },
  password: {
    isString: { errorMessage: "Password must be a string" },
    isLength: {
      options: { min: 6, max: 100 },
      errorMessage: "Password must be 6-100 characters",
    },
  },
  firstName: {
    isString: { errorMessage: "First name must be a string" },
    notEmpty: { errorMessage: "First name is required" },
    isLength: {
      options: { max: 50 },
      errorMessage: "First name must be max 50 characters",
    },
  },
  lastName: {
    isString: { errorMessage: "Last name must be a string" },
    notEmpty: { errorMessage: "Last name is required" },
    isLength: {
      options: { max: 50 },
      errorMessage: "Last name must be max 50 characters",
    },
  },
};

export const loginValidationSchema = {
  username: {
    isString: { errorMessage: "Username must be a string" },
    notEmpty: { errorMessage: "Username is required" },
  },
  password: {
    isString: { errorMessage: "Password must be a string" },
    notEmpty: { errorMessage: "Password is required" },
  },
};

export const conversationValidationSchema = {
  title: {
    optional: true,
    isString: { errorMessage: "Title must be a string" },
    isLength: {
      options: { max: 100 },
      errorMessage: "Title must be max 100 characters",
    },
  },
};

export const messageValidationSchema = {
  content: {
    isString: { errorMessage: "Content must be a string" },
    notEmpty: { errorMessage: "Message content is required" },
    isLength: {
      options: { max: 10000 },
      errorMessage: "Message must be max 10,000 characters",
    },
  },
  role: {
    isIn: {
      options: [["user", "assistant"]],
      errorMessage: 'Role must be either "user" or "assistant"',
    },
  },
};
