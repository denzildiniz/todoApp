# Backend Project Overview & Architecture

## Project Summary

This is a **Todo/Task Management API** - a RESTful backend service that allows users to:
- Create accounts (register/login)
- Manage personal tasks
- Organize tasks (mark complete, search, filter)

**Technology Stack**: Express.js | TypeScript | MongoDB | JWT Authentication

---

## High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                  Client (Frontend)                      │
│              (React, Vue, Angular, etc.)               │
└─────────────────────────┬──────────────────────────────┘
                          │
                          │ HTTP/REST
                          ▼
┌────────────────────────────────────────────────────────┐
│                   Express Server                        │
│              (src/server.ts)                           │
├────────────────────────────────────────────────────────┤
│ Routes Layer                                            │
│ ├─ authRoutes.ts     (GET /api/auth/*)                │
│ └─ taskRoutes.ts     (GET /api/tasks/*)               │
├────────────────────────────────────────────────────────┤
│ Middleware Layer                                        │
│ └─ authMiddleware.ts (JWT verification)               │
├────────────────────────────────────────────────────────┤
│ Controllers Layer                                       │
│ ├─ authController.ts (register, login logic)          │
│ └─ taskController.ts (CRUD operations)                │
├────────────────────────────────────────────────────────┤
│ Models Layer (Mongoose)                                │
│ ├─ User.ts          (User schema)                      │
│ └─ Task.ts          (Task schema)                      │
└─────────────────────────┬──────────────────────────────┘
                          │
                          │ MongoDB Protocol
                          ▼
┌────────────────────────────────────────────────────────┐
│              MongoDB Database                          │
│  ├─ users collection   (User documents)               │
│  └─ tasks collection   (Task documents)               │
└────────────────────────────────────────────────────────┘
```

---

## Folder Structure with Details

```
backend/
│
├── src/                          # All source code
│   │
│   ├── server.ts                 # ENTRY POINT
│   │                              # - Initializes Express app
│   │                              # - Sets up middleware
│   │                              # - Connects to MongoDB
│   │                              # - Starts HTTP server
│   │
│   ├── config/
│   │   └── db.ts                 # Database configuration
│   │                              # - MongoDB connection function
│   │                              # - (Not actively used, connection in server.ts)
│   │
│   ├── models/                   # Database schemas
│   │   ├── User.ts               # User model
│   │   │                          # - Stores user credentials
│   │   │                          # - Email unique constraint
│   │   │                          # - Password field hidden by default
│   │   │                          # - Timestamps auto-added
│   │   │
│   │   └── Task.ts               # Task model
│   │                              # - Stores task information
│   │                              # - References to User (ownership)
│   │                              # - Completion status
│   │                              # - Timestamps auto-added
│   │
│   ├── controllers/               # Business logic
│   │   ├── authController.ts     # Authentication logic
│   │   │                          # - registerUser()    → Create account
│   │   │                          # - loginUser()       → Generate JWT token
│   │   │
│   │   └── taskController.ts     # Task operations
│   │                              # - getTasks()        → Fetch user's tasks
│   │                              # - createTask()      → Add new task
│   │                              # - updateTask()      → Modify task
│   │                              # - deleteTask()      → Remove task
│   │
│   ├── routes/                    # API endpoint definitions
│   │   ├── authRoutes.ts         # Auth endpoints
│   │   │                          # - POST /api/auth/register
│   │   │                          # - POST /api/auth/login
│   │   │
│   │   └── taskRoutes.ts         # Task endpoints
│   │                              # - GET    /api/tasks
│   │                              # - POST   /api/tasks
│   │                              # - PATCH  /api/tasks/:id
│   │                              # - DELETE /api/tasks/:id
│   │
│   └── middleware/                # Request processing
│       └── authMiddleware.ts      # JWT verification
│                                  # - Validates token
│                                  # - Extracts user ID
│                                  # - Protects routes
│
├── package.json                  # Project metadata & dependencies
├── tsconfig.json                 # TypeScript configuration
├── .env                          # Environment variables (CREATE THIS)
├── dist/                         # Compiled JavaScript (generated)
└── node_modules/                # Dependencies (generated)
```

---

## Data Flow Diagrams

### Authentication Flow

```
USER REGISTRATION:
┌─────────────────────────────────────────────────────────┐
│ 1. User submits registration form                       │
│    (name, email, password)                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Client sends POST /api/auth/register                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Server receives request at authRoutes.ts            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Controller (registerUser) processes:                │
│    a) Check if email already exists                     │
│    b) Hash password with bcryptjs                       │
│    c) Create user document in MongoDB                   │
│    d) Return user info (no password)                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Client receives 201 Created response                │
│    with user ID, name, email                           │
└─────────────────────────────────────────────────────────┘


USER LOGIN:
┌─────────────────────────────────────────────────────────┐
│ 1. User submits login form                             │
│    (email, password)                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Client sends POST /api/auth/login                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Controller (loginUser) processes:                   │
│    a) Find user by email                               │
│    b) Compare provided password with stored hash       │
│    c) If match: Generate JWT token                     │
│    d) Return token & user info                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Client receives 200 OK response                     │
│    with JWT token (24-hour expiry)                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Client stores token (localStorage/sessionStorage)   │
│    and includes in subsequent requests:                 │
│    Authorization: Bearer <token>                        │
└─────────────────────────────────────────────────────────┘
```

### Task Management Flow

```
CREATE TASK:
┌─────────────────────────────────────────────────────────┐
│ 1. Authenticated user submits task creation            │
│    Authorization: Bearer <token>                        │
│    Body: { title: "My task" }                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. authMiddleware.ts:                                   │
│    - Extract token from Authorization header           │
│    - Verify token signature                            │
│    - Extract user ID from token                        │
│    - Attach userId to request object                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Controller (createTask) processes:                   │
│    a) Extract title from request body                  │
│    b) Create task document:                            │
│       { title, completed: false, user: userId }        │
│    c) Save to MongoDB                                  │
│    d) Return created task with ID                      │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Client receives 201 Created response                │
│    with full task object (including _id, timestamps)   │
└─────────────────────────────────────────────────────────┘


GET TASKS (with filtering):
┌─────────────────────────────────────────────────────────┐
│ 1. Client sends GET /api/tasks?status=incomplete      │
│    Authorization: Bearer <token>                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. authMiddleware verifies token                        │
│    and extracts userId                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Controller (getTasks) processes:                     │
│    a) Build query: { user: userId, completed: false } │
│    b) Apply pagination (page, limit)                   │
│    c) Execute MongoDB query                            │
│    d) Count total matching documents                   │
│    e) Return paginated results with metadata           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Client receives 200 OK response                     │
│    with:                                                │
│    - total: number of matching tasks                   │
│    - page: current page number                         │
│    - pages: total number of pages                      │
│    - tasks: array of task objects                      │
└─────────────────────────────────────────────────────────┘


UPDATE TASK:
┌─────────────────────────────────────────────────────────┐
│ 1. Client sends PATCH /api/tasks/:id                   │
│    Authorization: Bearer <token>                        │
│    Body: { completed: true }                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. authMiddleware verifies token                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Controller (updateTask) processes:                   │
│    a) Find task by ID                                  │
│    b) Update provided fields:                          │
│       - Only update if value !== undefined             │
│    c) Save changes to MongoDB                          │
│    d) Return updated task                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Client receives 200 OK response                     │
│    with updated task object                            │
└─────────────────────────────────────────────────────────┘


DELETE TASK:
┌─────────────────────────────────────────────────────────┐
│ 1. Client sends DELETE /api/tasks/:id                  │
│    Authorization: Bearer <token>                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. authMiddleware verifies token                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Controller (deleteTask) processes:                   │
│    a) Delete task by ID from MongoDB                   │
│    b) Return success message                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Client receives 200 OK response                     │
│    with deletion confirmation message                  │
└─────────────────────────────────────────────────────────┘
```

---

## Key Components Explained

### 1. Models (Database Layer)

**Purpose**: Define database schema structure

**User Model**:
- Stores user account information
- Email is unique (only one account per email)
- Password is hashed and hidden by default
- Auto-timestamps for creation and updates

**Task Model**:
- Stores task information
- References the User who owns the task
- Tracks completion status
- Auto-timestamps for creation and updates

### 2. Controllers (Business Logic Layer)

**Purpose**: Handle application logic

**authController**:
- `registerUser()`: Validates input, hashes password, creates user
- `loginUser()`: Authenticates user, generates JWT token

**taskController**:
- `getTasks()`: Retrieves user's tasks with filtering/pagination
- `createTask()`: Creates new task with user association
- `updateTask()`: Modifies task (title or status)
- `deleteTask()`: Removes task

### 3. Routes (API Endpoint Layer)

**Purpose**: Define API endpoints and connect to controllers

**authRoutes**:
- POST `/api/auth/register` → `registerUser()`
- POST `/api/auth/login` → `loginUser()`

**taskRoutes**:
- GET `/api/tasks` → `getTasks()` (with middleware)
- POST `/api/tasks` → `createTask()` (with middleware)
- PATCH `/api/tasks/:id` → `updateTask()` (with middleware)
- DELETE `/api/tasks/:id` → `deleteTask()` (with middleware)

### 4. Middleware (Request Processing)

**Purpose**: Process requests before they reach controllers

**authMiddleware**:
1. Checks for Authorization header
2. Verifies JWT token signature
3. Extracts user ID from token
4. Attaches user ID to request
5. Allows/denies request based on verification

---

## API Endpoint Summary

| Feature | Endpoint | Method | Auth | Purpose |
|---------|----------|--------|------|---------|
| **API Info** | `/api` | GET | ❌ | Get API details |
| **Register** | `/api/auth/register` | POST | ❌ | Create account |
| **Login** | `/api/auth/login` | POST | ❌ | Get JWT token |
| **Get Tasks** | `/api/tasks` | GET | ✅ | Fetch user's tasks |
| **Create Task** | `/api/tasks` | POST | ✅ | Add new task |
| **Update Task** | `/api/tasks/:id` | PATCH | ✅ | Modify task |
| **Delete Task** | `/api/tasks/:id` | DELETE | ✅ | Remove task |

---

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,          // User's full name
  email: String,         // Unique email address
  password: String,      // Hashed password (bcrypt)
  createdAt: DateTime,   // Account creation timestamp
  updatedAt: DateTime    // Last update timestamp
}
```

### Tasks Collection

```javascript
{
  _id: ObjectId,
  title: String,         // Task description
  completed: Boolean,    // Is task done?
  user: ObjectId,        // Reference to User document
  createdAt: DateTime,   // Task creation timestamp
  updatedAt: DateTime    // Last update timestamp
}
```

---

## Technology Stack Details

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 16.x+ | JavaScript runtime |
| **Express.js** | 5.2.1 | Web framework |
| **TypeScript** | 6.0.3 | Type-safe JavaScript |
| **MongoDB** | 5.x+ | NoSQL database |
| **Mongoose** | 9.5.0 | MongoDB object modeling |
| **JWT** | 9.0.3 | Token-based authentication |
| **bcryptjs** | 3.0.3 | Password hashing |
| **CORS** | 2.8.6 | Cross-origin resource sharing |
| **dotenv** | 17.4.2 | Environment variables |

---

## Security Features

1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **JWT Tokens**: 24-hour expiry, HMAC-SHA256 signature
3. **Route Protection**: authMiddleware guards task routes
4. **Email Uniqueness**: Prevents duplicate accounts
5. **CORS**: Controlled cross-origin access
6. **Password Hiding**: Password field excluded from queries by default

---

## Performance Features

1. **Pagination**: Limit results per request (default 10)
2. **Filtering**: Search and status-based filtering
3. **Sorting**: Sort tasks by field
4. **Database Indexing**: Unique index on email
5. **Middleware Chaining**: Efficient request processing

---

## Error Handling

All endpoints return structured error responses:

```json
{
  "message": "Error description"
}
```

Status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Server Error

---

## Development Best Practices

1. **Type Safety**: Full TypeScript coverage
2. **Error Handling**: Try-catch in all async functions
3. **Code Organization**: Separation of concerns
4. **Middleware Pattern**: Reusable middleware
5. **Environment Config**: Externalized configuration
6. **Schema Validation**: Mongoose schema validation

---

## Documentation Files

| File | Purpose |
|------|---------|
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Complete API reference |
| [CODE_DOCUMENTATION.md](CODE_DOCUMENTATION.md) | Code explanation & flows |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick lookup guide |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Installation & setup |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | This file - architecture overview |

---

## Getting Started

1. **Setup**: Follow [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. **Understanding**: Read [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) (this file)
3. **API Reference**: Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
4. **Code Details**: Review [CODE_DOCUMENTATION.md](CODE_DOCUMENTATION.md)
5. **Quick Lookup**: Use [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## Common Questions

**Q: How does authentication work?**
A: User logs in with email/password → receives JWT token → includes token in Authorization header for protected endpoints

**Q: Are tasks shared between users?**
A: No, each task is tied to a specific user via the `user` field. Users only see their own tasks.

**Q: What happens when JWT token expires?**
A: Returns 401 Unauthorized. User must login again to get a new token.

**Q: Can I see other users' tasks?**
A: No, getTasks only returns tasks where `user` matches the authenticated user's ID.

**Q: Is password stored in plaintext?**
A: No, passwords are hashed using bcryptjs before storage.

**Q: How long do JWT tokens last?**
A: 24 hours from creation. After 24 hours, user must login again.

---

## System Dependencies

```
Node.js (16.x or higher)
  ├── npm (comes with Node.js)
  └── MongoDB (local or cloud)
```

---

## Next Steps

1. **Install**: `npm install`
2. **Configure**: Create `.env` file with environment variables
3. **Start**: `npm run dev`
4. **Test**: Make API requests using curl or Postman
5. **Develop**: Modify code in `src/` folder
6. **Deploy**: Follow production checklist in SETUP_GUIDE.md

---

**Project Version**: 1.0  
**Last Updated**: April 25, 2026  
**Documentation Status**: Complete
