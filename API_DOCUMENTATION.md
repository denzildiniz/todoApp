# Backend API Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Installation & Setup](#installation--setup)
4. [Environment Variables](#environment-variables)
5. [Data Models](#data-models)
6. [Middleware](#middleware)
7. [API Endpoints](#api-endpoints)
8. [Usage Examples](#usage-examples)
9. [Error Handling](#error-handling)

---

## Project Overview

This is a **Todo/Task Management API** built with:
- **Framework**: Express.js 5.2.1
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for cross-origin requests

**API Version**: 1.0  
**Base URL**: `http://localhost:5000/api` (default)

---

## Folder Structure

```
backend/
├── src/
│   ├── server.ts                 # Main server entry point
│   ├── config/
│   │   └── db.ts                 # Database configuration
│   ├── controllers/
│   │   ├── authController.ts     # Authentication logic
│   │   └── taskController.ts     # Task management logic
│   ├── middleware/
│   │   └── authMiddleware.ts     # JWT verification middleware
│   ├── models/
│   │   ├── User.ts               # User schema
│   │   └── Task.ts               # Task schema
│   └── routes/
│       ├── authRoutes.ts         # Auth endpoints
│       └── taskRoutes.ts         # Task endpoints
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── .env                          # Environment variables (not included)
```

### Directory Descriptions

| Directory | Purpose |
|-----------|---------|
| `src/` | Source code directory |
| `src/config/` | Configuration files (DB connection) |
| `src/controllers/` | Business logic for routes |
| `src/middleware/` | Express middleware (authentication) |
| `src/models/` | Mongoose schemas and models |
| `src/routes/` | API route definitions |

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your-secret-key-here
```

### 3. Start Development Server

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/todo-app` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key` |

---

## Data Models

### User Model

**File**: [src/models/User.ts](src/models/User.ts)

**Schema**:
```typescript
{
  _id: ObjectId (auto-generated)
  name: String (required)
  email: String (required, unique)
  password: String (required, not selected by default)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

**Example User Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "$2a$10$...", // hashed
  "createdAt": "2024-04-25T10:00:00Z",
  "updatedAt": "2024-04-25T10:00:00Z"
}
```

### Task Model

**File**: [src/models/Task.ts](src/models/Task.ts)

**Schema**:
```typescript
{
  _id: ObjectId (auto-generated)
  title: String (required)
  completed: Boolean (default: false)
  user: ObjectId (reference to User, required)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

**Example Task Document**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Complete project documentation",
  "completed": false,
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-04-25T10:00:00Z",
  "updatedAt": "2024-04-25T10:00:00Z"
}
```

---

## Middleware

### Authentication Middleware

**File**: [src/middleware/authMiddleware.ts](src/middleware/authMiddleware.ts)

**Purpose**: Protects routes by verifying JWT tokens

**How It Works**:
1. Checks for `Authorization` header with format: `Bearer <token>`
2. Verifies the JWT token using `JWT_SECRET`
3. Extracts user ID and attaches it to the request object
4. Passes control to the next middleware/route handler

**Custom Request Interface**:
```typescript
interface AuthRequest extends Request {
  userId?: string  // User ID extracted from JWT
}
```

**Error Responses**:
- `401`: Missing or invalid Authorization header
- `401`: Invalid or expired token

**Usage in Routes**:
```typescript
router.post("/", authMiddleware, createTask)  // Protected route
```

---

## API Endpoints

### Root Endpoint

#### Get API Information

```http
GET /api
```

**Description**: Returns basic API information and available endpoints

**Response**: `200 OK`
```json
{
  "name": "Todo API",
  "version": "1.0",
  "endpoints": [
    "/api/auth/register",
    "/api/auth/login",
    "/api/tasks"
  ]
}
```

---

## Authentication Endpoints

Base URL: `/api/auth`

### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json
```

**Description**: Create a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | User's full name |
| `email` | String | Yes | User's email (must be unique) |
| `password` | String | Yes | User's password (will be hashed) |

**Response**: `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses**:
- `400 Bad Request`: User already exists
  ```json
  {
    "message": "User already exists"
  }
  ```
- `500 Internal Server Error`: Server error
  ```json
  {
    "message": "Server error"
  }
  ```

---

### 2. Login User

```http
POST /api/auth/login
Content-Type: application/json
```

**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | User's email |
| `password` | String | Yes | User's password |

**Response**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Token Details**:
- Expires in: 24 hours
- Algorithm: HS256
- Secret: `JWT_SECRET` from environment variables

**Error Responses**:
- `400 Bad Request`: Invalid credentials
  ```json
  {
    "message": "Invalid credentials"
  }
  ```
- `500 Internal Server Error`: Server error
  ```json
  {
    "message": "Server error"
  }
  ```

---

## Task Endpoints

Base URL: `/api/tasks`

**⚠️ All task endpoints require authentication. Include the JWT token in the Authorization header:**

```http
Authorization: Bearer <your_jwt_token>
```

---

### 3. Get All Tasks

```http
GET /api/tasks
Authorization: Bearer <token>
```

**Description**: Retrieve all tasks for the authenticated user with filtering and pagination options

**Query Parameters**:
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | String | Filter by status: `"complete"` or `"incomplete"` | `?status=complete` |
| `search` | String | Search tasks by title (case-insensitive) | `?search=project` |
| `sort` | String | Sort by field (1 = ascending) | `?sort=createdAt` |
| `page` | Number | Page number for pagination | `?page=1` |
| `limit` | Number | Tasks per page | `?limit=10` |

**Response**: `200 OK`
```json
{
  "total": 25,
  "page": 1,
  "pages": 3,
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Complete project documentation",
      "completed": false,
      "user": "507f1f77bcf86cd799439011",
      "createdAt": "2024-04-25T10:00:00Z",
      "updatedAt": "2024-04-25T10:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Review code",
      "completed": true,
      "user": "507f1f77bcf86cd799439011",
      "createdAt": "2024-04-24T10:00:00Z",
      "updatedAt": "2024-04-25T09:00:00Z"
    }
  ]
}
```

**Example Requests**:
```bash
# Get completed tasks
GET /api/tasks?status=complete

# Search for tasks
GET /api/tasks?search=documentation

# Get incomplete tasks with pagination
GET /api/tasks?status=incomplete&page=1&limit=5

# Sort by creation date
GET /api/tasks?sort=createdAt&limit=20
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

### 4. Create Task

```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json
```

**Description**: Create a new task for the authenticated user

**Request Body**:
```json
{
  "title": "Complete project documentation"
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Task title/description |

**Response**: `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "title": "Complete project documentation",
  "completed": false,
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-04-25T10:30:00Z",
  "updatedAt": "2024-04-25T10:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

### 5. Update Task

```http
PATCH /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Description**: Update a specific task (mark as complete, change title)

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Task ID (MongoDB ObjectId) |

**Request Body** (all fields optional):
```json
{
  "title": "Updated task title",
  "completed": true
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | No | New task title |
| `completed` | Boolean | No | Mark task as complete/incomplete |

**Response**: `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "title": "Updated task title",
  "completed": true,
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-04-25T10:30:00Z",
  "updatedAt": "2024-04-25T11:00:00Z"
}
```

**Example Requests**:
```bash
# Mark task as complete
PATCH /api/tasks/507f1f77bcf86cd799439014
{
  "completed": true
}

# Update title
PATCH /api/tasks/507f1f77bcf86cd799439014
{
  "title": "New title"
}

# Update both
PATCH /api/tasks/507f1f77bcf86cd799439014
{
  "title": "New title",
  "completed": true
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Task not found
  ```json
  {
    "message": "Task not found"
  }
  ```
- `500 Internal Server Error`: Server error

---

### 6. Delete Task

```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

**Description**: Delete a specific task

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | String | Task ID (MongoDB ObjectId) |

**Response**: `200 OK`
```json
{
  "message": "Task deleted"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `500 Internal Server Error`: Server error

---

## Usage Examples

### Complete Workflow Example

#### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "myPassword123"
  }'
```

**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Alice Smith",
    "email": "alice@example.com"
  }
}
```

#### 2. Login to Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "myPassword123"
  }'
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcxNDAxMjAwMCwiZXhwIjoxNzE0MDk4NDAwfQ.abcdef123456",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Alice Smith",
    "email": "alice@example.com"
  }
}
```

#### 3. Create a Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries"
  }'
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Buy groceries",
  "completed": false,
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-04-25T10:30:00Z",
  "updatedAt": "2024-04-25T10:30:00Z"
}
```

#### 4. Get All Tasks

```bash
curl -X GET "http://localhost:5000/api/tasks?status=incomplete&limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response**:
```json
{
  "total": 3,
  "page": 1,
  "pages": 1,
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Buy groceries",
      "completed": false,
      "user": "507f1f77bcf86cd799439011",
      "createdAt": "2024-04-25T10:30:00Z",
      "updatedAt": "2024-04-25T10:30:00Z"
    }
  ]
}
```

#### 5. Mark Task as Complete

```bash
curl -X PATCH http://localhost:5000/api/tasks/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

**Response**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Buy groceries",
  "completed": true,
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-04-25T10:30:00Z",
  "updatedAt": "2024-04-25T11:00:00Z"
}
```

#### 6. Delete a Task

```bash
curl -X DELETE http://localhost:5000/api/tasks/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response**:
```json
{
  "message": "Task deleted"
}
```

---

### JavaScript/Fetch Examples

#### Register
```javascript
const register = async () => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    })
  });
  const data = await response.json();
  console.log(data);
};
```

#### Login
```javascript
const login = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'password123'
    })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.token;
};
```

#### Create Task
```javascript
const createTask = async (token, title) => {
  const response = await fetch('http://localhost:5000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title })
  });
  const data = await response.json();
  console.log(data);
};
```

#### Get Tasks
```javascript
const getTasks = async (token) => {
  const response = await fetch('http://localhost:5000/api/tasks', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  console.log(data.tasks);
};
```

#### Update Task
```javascript
const updateTask = async (token, taskId, updates) => {
  const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  const data = await response.json();
  console.log(data);
};
```

#### Delete Task
```javascript
const deleteTask = async (token, taskId) => {
  const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  console.log(data);
};
```

---

## Error Handling

### Common HTTP Status Codes

| Status | Description |
|--------|-------------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing or invalid token |
| `404` | Not Found - Resource not found |
| `500` | Internal Server Error - Server error |

### Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

### Common Error Scenarios

#### Missing Authorization Header
```
Status: 401 Unauthorized
Response: {
  "message": "Not authorized"
}
```

#### Invalid Token
```
Status: 401 Unauthorized
Response: {
  "message": "Token invalid"
}
```

#### User Already Exists
```
Status: 400 Bad Request
Response: {
  "message": "User already exists"
}
```

#### Invalid Credentials
```
Status: 400 Bad Request
Response: {
  "message": "Invalid credentials"
}
```

---

## Security Notes

1. **JWT Tokens**: Always include tokens in the `Authorization` header with `Bearer` prefix
2. **Token Expiry**: Tokens expire after 24 hours - users need to login again
3. **Password Hashing**: Passwords are hashed using bcryptjs with salt rounds of 10
4. **CORS**: Enabled for all origins (configure in production)
5. **Unique Emails**: Email addresses must be unique per user
6. **Protected Routes**: All task routes require authentication

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with auto-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |

---

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running locally or remote server is accessible
- Check `MONGO_URI` in `.env` file
- Verify network connectivity

### Invalid Token Error
- Token may have expired (24-hour expiry)
- Login again to get a new token
- Ensure `JWT_SECRET` matches between `.env` and code

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill process using the current port

### CORS Issues
- CORS is enabled for all origins
- Check browser console for specific error messages

---

## Support & Contact

For issues or questions about this API, please review the code comments and structure in the src directory.

---

**Last Updated**: April 25, 2026  
**API Version**: 1.0
