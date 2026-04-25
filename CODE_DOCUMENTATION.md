# Code Documentation & Architecture Guide

## Overview

This document provides detailed explanations of the code structure, how each component works, and how they interact.

---

## Table of Contents

1. [Server Setup](#server-setup)
2. [Models & Schema](#models--schema)
3. [Controllers](#controllers)
4. [Middleware](#middleware)
5. [Routes](#routes)
6. [Database Connection](#database-connection)
7. [Code Flow Diagrams](#code-flow-diagrams)

---

## Server Setup

**File**: [src/server.ts](src/server.ts)

### What It Does
- Initializes the Express application
- Sets up middleware (CORS, JSON parsing)
- Connects to MongoDB
- Registers routes
- Starts the HTTP server

### Code Breakdown

```typescript
import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"

import authRoutes from "./routes/authRoutes"
import taskRoutes from "./routes/taskRoutes"

// Load environment variables from .env file
dotenv.config()

// Create Express app instance
const app = express()

// Enable CORS for all origins (frontend can make requests)
app.use(cors())

// Parse incoming JSON request bodies
app.use(express.json())

// Root endpoint - returns API information
app.get("/api", (req, res) => {
  res.json({
    name: "Todo API",
    version: "1.0",
    endpoints: [
      "/api/auth/register",
      "/api/auth/login",
      "/api/tasks"
    ]
  })
})

// Register routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

const PORT = process.env.PORT || 5000

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("MongoDB connected")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => console.log(error))
```

### Key Points
- `dotenv.config()`: Loads `.env` variables into `process.env`
- `cors()`: Middleware allowing frontend apps to communicate with backend
- `express.json()`: Middleware to parse request bodies as JSON
- MongoDB connection is established before server starts

---

## Models & Schema

### User Model

**File**: [src/models/User.ts](src/models/User.ts)

```typescript
import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true  // Only one user per email
    },
    password: {
      type: String,
      required: true,
      select: false  // Don't include password in queries by default
    }
  },
  { timestamps: true }  // Automatically adds createdAt and updatedAt
)

export default mongoose.model("User", userSchema)
```

**Fields**:
- `name`: User's full name
- `email`: Unique email identifier
- `password`: Hashed password (not returned in queries by default)
- `timestamps`: Automatic creation and update timestamps

**Why `select: false`?**
- Prevents accidentally sending password hashes to frontend
- Must explicitly call `.select("+password")` when password is needed (during login)

---

### Task Model

**File**: [src/models/Task.ts](src/models/Task.ts)

```typescript
import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false  // New tasks are incomplete by default
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // References the User model (relationship)
      required: true
    }
  },
  { timestamps: true }
)

export default mongoose.model("Task", taskSchema)
```

**Fields**:
- `title`: Task description
- `completed`: Whether task is done
- `user`: Reference to the User who owns this task
- `timestamps`: Automatic creation and update timestamps

**Why the User Reference?**
- Links each task to a specific user
- Allows fetching only tasks belonging to the authenticated user
- Maintains data isolation between users

---

## Controllers

Controllers contain the business logic that processes requests and sends responses.

### Authentication Controller

**File**: [src/controllers/authController.ts](src/controllers/authController.ts)

#### registerUser Function

```typescript
export const registerUser = async (req: Request, res: Response) => {
  try {
    // 1. Extract data from request body
    const { name, email, password } = req.body

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // 3. Hash password using bcrypt (cost factor: 10)
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Create new user document in database
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    // 5. Return created user (without password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
```

**Flow**:
1. Extract credentials from request
2. Check for duplicate email
3. Hash password securely
4. Save user to database
5. Return success response

**Why bcryptjs?**
- One-way hashing: Can't reverse to get original password
- Salt rounds (10): Makes rainbow table attacks infeasible
- Slows down brute force attacks

---

#### loginUser Function

```typescript
export const loginUser = async (req: Request, res: Response) => {
  try {
    // 1. Extract credentials
    const { email, password } = req.body

    // 2. Find user by email and include password (normally hidden)
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // 3. Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // 4. Generate JWT token (valid for 24 hours)
    const token = jwt.sign(
      { id: user._id },  // Payload
      process.env.JWT_SECRET as string,  // Secret key
      { expiresIn: "1d" }  // Expiration
    )

    // 5. Return token and user info
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
```

**Flow**:
1. Extract email and password
2. Find user (with password included)
3. Compare password with hash
4. Generate JWT token (includes user ID)
5. Return token and user info

**JWT Token Structure**:
- **Header**: `{ alg: "HS256", typ: "JWT" }`
- **Payload**: `{ id: "user_id", iat: timestamp, exp: expiry_timestamp }`
- **Signature**: HMAC-SHA256 signature

---

### Task Controller

**File**: [src/controllers/taskController.ts](src/controllers/taskController.ts)

#### getTasks Function

```typescript
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Extract query parameters
    const { status, search, sort, page = "1", limit = "10" } = req.query

    // 2. Build query filter (tasks belonging to current user)
    const query: any = { user: req.userId }

    // 3. Apply status filter
    if (status === "complete") query.completed = true
    if (status === "incomplete") query.completed = false

    // 4. Apply search filter (case-insensitive regex)
    if (search) {
      query.title = { $regex: search, $options: "i" }
    }

    // 5. Calculate pagination
    const pageNumber = parseInt(page as string)
    const limitNumber = parseInt(limit as string)
    const skip = (pageNumber - 1) * limitNumber

    // 6. Build query
    let tasksQuery = Task.find(query)

    // 7. Apply sorting if specified
    if (sort) {
      tasksQuery = tasksQuery.sort({ [sort as string]: 1 })
    }

    // 8. Execute query with pagination
    const tasks = await tasksQuery.skip(skip).limit(limitNumber)

    // 9. Get total count for pagination info
    const total = await Task.countDocuments(query)

    // 10. Return paginated results
    res.json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      tasks
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
```

**Query Building**:
- `{ $regex: search, $options: "i" }`: Case-insensitive search
- `skip(n)`: Skip first n documents
- `limit(n)`: Return maximum n documents

**Example Queries**:
```javascript
// All incomplete tasks for user
{ user: userId, completed: false }

// Search for "project" in titles
{ user: userId, title: { $regex: "project", $options: "i" } }

// Completed tasks, page 2, 10 per page
// Skip 10, limit 10
```

---

#### createTask Function

```typescript
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Extract title from request body
    const { title } = req.body

    // 2. Create task with user association
    const task = await Task.create({
      title,
      user: req.userId  // From authMiddleware
    })

    // 3. Return created task
    res.status(201).json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
```

**Why `req.userId`?**
- Extracted from JWT token by `authMiddleware`
- Prevents users from creating tasks for other users
- Ensures data isolation

---

#### updateTask Function

```typescript
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Extract update data
    const { title, completed } = req.body

    // 2. Find task by ID
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // 3. Update title if provided
    if (title !== undefined) {
      task.title = title
    }

    // 4. Update completed status if provided
    if (completed !== undefined) {
      task.completed = completed
    }

    // 5. Save changes to database
    await task.save()

    // 6. Return updated task
    res.json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
```

**Partial Updates**:
- Only updates fields that are provided
- Other fields remain unchanged
- `undefined` check prevents clearing fields with `null`

---

#### deleteTask Function

```typescript
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Delete task by ID
    await Task.findByIdAndDelete(req.params.id)

    // 2. Return success message
    res.json({ message: "Task deleted" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
```

**Note**: Simple deletion without checking ownership - could be enhanced to verify the task belongs to the authenticated user.

---

## Middleware

### Authentication Middleware

**File**: [src/middleware/authMiddleware.ts](src/middleware/authMiddleware.ts)

```typescript
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

// Extend Express Request type to include userId
export interface AuthRequest extends Request {
  userId?: string
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Get Authorization header
  const authHeader = req.headers.authorization

  // 2. Check for Bearer token format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" })
  }

  try {
    // 3. Extract token (remove "Bearer " prefix)
    const token = authHeader.split(" ")[1]

    // 4. Verify token signature using secret
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string }

    // 5. Attach user ID to request object
    req.userId = decoded.id

    // 6. Pass to next middleware/route handler
    next()
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" })
  }
}

export default authMiddleware
```

**Execution Flow**:
1. Client sends: `Authorization: Bearer eyJhbGc...`
2. Middleware extracts token
3. Token verified against JWT_SECRET
4. User ID extracted and attached to `req.userId`
5. Next handler receives `req.userId` in request object

**Why This Pattern?**
- Stateless: No sessions stored on server
- Scalable: Works with multiple server instances
- Secure: Token tampered with = verification fails

---

## Routes

### Auth Routes

**File**: [src/routes/authRoutes.ts](src/routes/authRoutes.ts)

```typescript
import express from "express"
import { registerUser, loginUser } from "../controllers/authController"

const router = express.Router()

// POST /api/auth/register
router.post("/register", registerUser)

// POST /api/auth/login
router.post("/login", loginUser)

export default router
```

**No Middleware**: Auth routes are public (no authentication required)

---

### Task Routes

**File**: [src/routes/taskRoutes.ts](src/routes/taskRoutes.ts)

```typescript
import express from "express"
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from "../controllers/taskController"
import authMiddleware from "../middleware/authMiddleware"

const router = express.Router()

// All routes protected by authMiddleware
router.get("/", authMiddleware, getTasks)
router.post("/", authMiddleware, createTask)
router.patch("/:id", authMiddleware, updateTask)
router.delete("/:id", authMiddleware, deleteTask)

export default router
```

**Middleware Protection**: Each route has `authMiddleware` ensuring only authenticated users can access

---

## Database Connection

**File**: [src/config/db.ts](src/config/db.ts)

```typescript
import mongoose from "mongoose"

const connectDB = async () => {
  try {
    // Connect to MongoDB using MONGO_URI from environment
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      family: 4  // Use IPv4 (addresses some connection issues)
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)  // Exit process if connection fails
  }
}

export default connectDB
```

**Note**: Not currently used in `server.ts` - connection happens directly in server file

---

## Code Flow Diagrams

### User Registration Flow

```
┌─────────────────┐
│  Frontend       │
│  POST /register │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Express Receives    │
│ Request            │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ authRoutes         │
│ routes to          │
│ registerUser()     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Check if email      │
│ already exists      │
└────────┬────────────┘
         │
    ┌────┴───┐
    │         │
   YES       NO
    │         │
    │    ▼─────────────────┐
    │    │ Hash password   │
    │    │ with bcryptjs   │
    │    │ (salt 10)       │
    │    └────┬────────────┘
    │         │
    │    ▼─────────────────┐
    │    │ Create user     │
    │    │ in MongoDB      │
    │    └────┬────────────┘
    │         │
    │    ▼─────────────────┐
    │    │ Return 201      │
    │    │ with user info  │
    │    └──────┬──────────┘
    │           │
    ▼      ▼────────────┐
┌──────────────────────┘
│ Return 400
│ "User exists"
└──────────────────────┘
```

### Authentication & Task Retrieval Flow

```
┌────────────────────────────────┐
│ Frontend                        │
│ GET /tasks                      │
│ Authorization: Bearer <token>  │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ taskRoutes                      │
│ authMiddleware is invoked       │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ authMiddleware                  │
│ - Extract token from header     │
│ - Verify token signature        │
│ - Extract user ID from token    │
│ - Attach to req.userId          │
└────────┬────────────────────────┘
         │
    ┌────┴──────┐
    │            │
  VALID      INVALID
    │            │
    ▼        ▼────────────┐
    │        │ Return 401 │
    │        │ Unauthorized
    │        └────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ getTasks() called               │
│ - Build query: { user: userId } │
│ - Apply filters (status, search)│
│ - Apply pagination              │
│ - Execute MongoDB query         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ MongoDB Returns                 │
│ Tasks matching query            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Return 200 with:                │
│ - total count                   │
│ - current page                  │
│ - total pages                   │
│ - tasks array                   │
└────────┬────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Frontend Receives Data          │
└────────────────────────────────┘
```

### Task Update Flow

```
┌──────────────────────────────────────┐
│ Frontend                             │
│ PATCH /tasks/507f1f77bcf86cd799...  │
│ Body: { completed: true }           │
│ Auth: Bearer <token>                │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ authMiddleware                       │
│ Verify token → Extract userId        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ updateTask()                         │
│ - Find task by ID                    │
└────────┬─────────────────────────────┘
         │
    ┌────┴─────┐
    │           │
  FOUND     NOT FOUND
    │           │
    ▼       ▼──────────────┐
    │       │ Return 404   │
    │       │ "Not found"  │
    │       └──────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│ Update task fields                   │
│ if (completed !== undefined)          │
│   task.completed = completed          │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ task.save()                          │
│ MongoDB updates document             │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Return 200 with updated task         │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Frontend Receives Updated Task       │
└──────────────────────────────────────┘
```

---

## Best Practices Used

### 1. Error Handling
- Try-catch blocks around all async operations
- Appropriate HTTP status codes
- User-friendly error messages

### 2. Security
- Passwords hashed with bcryptjs
- JWT tokens for stateless authentication
- Token expiry (24 hours)
- Middleware to protect routes
- CORS enabled

### 3. Code Organization
- Separation of concerns (routes, controllers, models)
- Reusable middleware
- Type-safe with TypeScript

### 4. Data Validation
- Required fields in schemas
- Unique email constraint
- User ownership check for tasks

### 5. Performance
- Pagination for large result sets
- Indexed fields (email unique, user reference)
- Efficient MongoDB queries

---

## Common Patterns

### Pattern 1: Async/Await with Error Handling
```typescript
export const someFunction = async (req: Request, res: Response) => {
  try {
    // Async operations
    const result = await SomeModel.find()
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
```

### Pattern 2: Query Filtering
```typescript
const query: any = { user: userId }

if (filter) {
  query.fieldName = filterValue
}

const results = await Model.find(query)
```

### Pattern 3: JWT Token Verification
```typescript
const token = authHeader.split(" ")[1]
const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
const userId = decoded.id
```

---

## Next Steps for Enhancement

1. **Validation**: Add request body validation (joi, yup)
2. **Error Handling**: Create custom error classes
3. **Logging**: Add request logging middleware
4. **Testing**: Add unit and integration tests
5. **API Documentation**: Add Swagger/OpenAPI documentation
6. **Rate Limiting**: Prevent abuse with rate limiting
7. **Caching**: Add Redis for performance
8. **Task Categories**: Add task categorization
9. **Due Dates**: Add task deadlines
10. **Notifications**: Add email/push notifications

---

**Document Updated**: April 25, 2026
