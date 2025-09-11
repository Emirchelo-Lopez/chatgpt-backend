# ChatGPT Clone - Express.js Backend

A robust Express.js backend API for a ChatGPT clone with user authentication and persistent chat storage using MongoDB.

## 🚀 Features

- **User Authentication**: Register, login, JWT-based auth
- **Chat Persistence**: Save conversations and messages to MongoDB
- **RESTful API**: Clean, organized endpoints
- **Input Validation**: Comprehensive request validation
- **Security**: Password hashing with bcrypt, JWT tokens
- **Error Handling**: Consistent error responses
- **Pagination**: Efficient data loading for conversations and messages

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Environment**: dotenv

## 📁 Project Structure

```
chatgpt-backend/
├── src/
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   └── Message.js
│   ├── routes/           # API routes
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── conversations.js
│   │   └── messages.js
│   ├── middleware/       # Custom middleware
│   │   └── auth.js
│   ├── utils/           # Helper functions
│   │   ├── helpers.js
│   │   └── validationSchemas.js
│   └── index.js         # Main server file
├── test/
│   └── api.rest         # API testing file
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Installation & Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd chatgpt-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/chatgpt-clone
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
SALT_ROUNDS=12
```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Conversations

- `GET /api/conversations` - Get all user conversations
- `GET /api/conversations/:id` - Get single conversation with messages
- `POST /api/conversations` - Create new conversation
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `PATCH /api/conversations/:id/archive` - Archive/unarchive conversation

### Messages

- `GET /api/messages/:conversationId` - Get messages for conversation
- `POST /api/messages` - Add message to conversation
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

### Health Check

- `GET /health` - Server health check

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Data Models

### User

```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  avatar: String (optional),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation

```javascript
{
  title: String,
  userId: ObjectId (ref: User),
  isArchived: Boolean,
  messageCount: Number,
  lastActivity: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message

```javascript
{
  conversationId: ObjectId (ref: Conversation),
  content: String,
  role: String (user|assistant),
  userId: ObjectId (ref: User),
  isEdited: Boolean,
  editedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

Use the provided `test/api.rest` file with VS Code REST Client extension to test all endpoints.

## 🚀 Deployment

The application is ready for deployment to services like:

- **Heroku**
- **Vercel**
- **Railway**
- **DigitalOcean**
- **AWS EC2**

Make sure to set environment variables in your deployment platform.

## 📚 Learning Objectives Covered

This project demonstrates the following Express.js fundamentals:

- ✅ **HTTP Requests**: GET, POST, PUT, PATCH, DELETE
- ✅ **Route Parameters**: Dynamic routing with `:id`
- ✅ **Query Parameters**: Filtering and pagination
- ✅ **Middlewares**: Authentication, validation, error handling
- ✅ **Validation**: Input validation with express-validator
- ✅ **Routers**: Modular route organization
- ✅ **Authentication**: JWT-based authentication
- ✅ **MongoDB Integration**: Mongoose ODM with schemas
- ✅ **Password Hashing**: bcrypt for secure password storage
- ✅ **Session Management**: JWT token handling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or run into issues, please create an issue in the repository.
