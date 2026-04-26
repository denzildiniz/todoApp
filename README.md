# 🛠️ Todo App (Backend API)

A robust, secure, and highly scalable RESTful API built with **Node.js, Express, TypeScript, and MongoDB**. This backend powers the Todo frontend application, handling user authentication, task management, pagination, and advanced querying.

## Live Environment

The API is currently deployed and accessible live at:
**[https://todo-api-jagm.onrender.com/api](https://todo-api-jagm.onrender.com/api)**

*(Please refer to the `API_DOCUMENTATION.md` file in this repository for a complete list of endpoints, payloads, and expected responses).*

## Features

- **JWT Authentication:** Secure user registration and login using JSON Web Tokens. Passwords are securely hashed via `bcryptjs`.
- **Route Protection:** Custom middleware (`authMiddleware`) ensures that only authenticated users can access, create, or modify their tasks.
- **Advanced Task Management:** 
  - Full CRUD operations tied securely to the authenticated user ID.
  - Built-in support for **Pagination** (`page`, `limit`).
  - Built-in support for **Filtering** (e.g., filter by `status=complete`).
  - Built-in support for **Search** via regular expressions (e.g., `search=keyword`).
- **MVC Architecture:** Clean separation of concerns strictly utilizing Models, Views (Routes), and Controllers.
- **TypeScript:** Fully strictly-typed backend ensuring high maintainability and developer experience.

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose ORM)
- **Authentication:** jsonwebtoken (JWT)
- **Security:** bcryptjs (Password Hashing), CORS

## Project Structure

```text
src/
├── config/
│   └── db.ts                # MongoDB connection setup
├── controllers/
│   ├── authController.ts    # Logic for User Login/Register
│   └── taskController.ts    # Logic for Task CRUD & Pagination
├── middleware/
│   └── authMiddleware.ts    # JWT verification logic
├── models/
│   ├── User.ts              # Mongoose User Schema
│   └── Task.ts              # Mongoose Task Schema
├── routes/
│   ├── authRoutes.ts        # Express endpoints for /api/auth
│   └── taskRoutes.ts        # Express endpoints for /api/tasks
└── server.ts                # Application Entry Point
```

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### 1. Installation

Clone the repository and install the dependencies:

```bash
cd todoApp
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todo_db # Or your MongoDB Atlas connection string
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Run the Development Server

Start the application in development mode (which automatically restarts on file changes via `ts-node-dev`):

```bash
npm run dev
```

The server will be running on `http://localhost:5000`.

## Production Build

To compile the TypeScript code into pure JavaScript for production deployment, run:

```bash
npm run build
```

This will generate a `dist/` directory. You can then start the production server with:

```bash
npm start
```
