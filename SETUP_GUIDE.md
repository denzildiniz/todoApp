# Setup & Installation Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Starting the Server](#starting-the-server)
5. [Verifying Installation](#verifying-installation)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure Walkthrough](#project-structure-walkthrough)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js**: Version 16.x or higher
  - Download: https://nodejs.org/
  - Verify: `node --version`

- **npm**: Usually comes with Node.js
  - Verify: `npm --version`

- **MongoDB**: For the database
  - Download: https://www.mongodb.com/try/download/community
  - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Optional Tools
- **Postman**: For testing API endpoints (https://www.postman.com/)
- **VS Code**: Code editor (https://code.visualstudio.com/)
- **Git**: Version control (https://git-scm.com/)

---

## Installation Steps

### Step 1: Clone or Download the Project

```bash
# If using git
git clone https://github.com/denzildiniz/todoApp.git
cd backend

# Or navigate to the project folder
cd "path/to/backend"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all packages listed in `package.json`:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- TypeScript and type definitions

**Expected Output**:
```
added XXX packages in X.XXs
```

### Step 3: Create Environment File

Create a `.env` file in the root directory:

```bash
# Windows (PowerShell)
echo. > .env

# Linux/Mac
touch .env
```

### Step 4: Configure Environment Variables

Open `.env` and add:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/todo-app

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
```

**⚠️ Important Notes**:
- `JWT_SECRET`: Use a strong, random string in production
- `MONGO_URI`: Replace with your MongoDB connection string if using a remote database
- `PORT`: Can be any unused port (5000, 3000, 8000, etc.)

### Step 5: Verify Installation

```bash
npm --version
node --version
```

Check if MongoDB is running:

```bash
# If using local MongoDB
mongo --version

# Or check MongoDB service status
# Windows: Services > MongoDB Server
# Linux: systemctl status mongod
# Mac: brew services list
```

---

## Configuration

### For Local MongoDB

**Windows**:
1. Install MongoDB Community Edition
2. MongoDB should run as a service automatically
3. Default connection: `mongodb://localhost:27017`

**Linux**:
```bash
# Start MongoDB service
sudo systemctl start mongod

# Check status
sudo systemctl status mongod
```

**Mac**:
```bash
# Install with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start service
brew services start mongodb-community
```

### For MongoDB Atlas (Cloud Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### Environment Variable Examples

**Development**:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/todo-app-dev
JWT_SECRET=dev-secret-key-123
```

**Production** (example - change all values):
```env
PORT=8080
MONGO_URI=mongodb+srv://user:pass@production-cluster.mongodb.net/todo-app
JWT_SECRET=super-secure-random-string-min-32-characters
```

---

## Starting the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

**Expected Output**:
```
MongoDB connected
Server running on port 5000
```

The server will automatically restart when you make code changes.

### Production Mode

First, build the TypeScript:
```bash
npm run build
```

Then start:
```bash
npm start
```

### Accessing the Server

Once running, access the API:
- **Root**: http://localhost:5000/api
- **Browser**: Open http://localhost:5000/api to see API info
- **API Base URL**: http://localhost:5000/api

---

## Verifying Installation

### Test 1: Check API is Running

Open browser or run:
```bash
curl http://localhost:5000/api
```

**Expected Response**:
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

### Test 2: Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testPassword123"
  }'
```

**Expected Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Test 3: Login to Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123"
  }'
```

**Expected Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Test 4: Create a Task (Protected Route)

```bash
# Replace <token> with the token from login response
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task"
  }'
```

**Expected Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "title": "Test task",
  "completed": false,
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-04-25T10:30:00Z",
  "updatedAt": "2024-04-25T10:30:00Z"
}
```

✅ **If all tests pass, your installation is successful!**

---

## Troubleshooting

### Issue: MongoDB Connection Error

**Error Message**: `MongoDB connection error` or `connect ECONNREFUSED`

**Solutions**:
1. **Check if MongoDB is running**:
   ```bash
   # Linux/Mac
   sudo systemctl status mongod
   
   # Windows
   # Check Services → MongoDB Server
   ```

2. **Start MongoDB** (if not running):
   ```bash
   # Linux/Mac
   sudo systemctl start mongod
   
   # Windows
   # Start MongoDB service from Services
   ```

3. **Verify connection string in `.env`**:
   ```env
   # Local MongoDB should be
   MONGO_URI=mongodb://localhost:27017/todo-app
   
   # For MongoDB Atlas
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
   ```

4. **Test MongoDB connection**:
   ```bash
   mongo "mongodb://localhost:27017"
   ```

### Issue: Port Already in Use

**Error Message**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
1. **Change the port in `.env`**:
   ```env
   PORT=5001  # Or any other unused port
   ```

2. **Kill the process using the port**:
   
   **Linux/Mac**:
   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```
   
   **Windows**:
   ```powershell
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Issue: Dependencies Not Installed

**Error Message**: `Cannot find module 'express'`

**Solution**:
```bash
npm install
```

If that doesn't work, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript Compilation Error

**Error Message**: `TypeScript error TS...`

**Solution**:
```bash
# Verify TypeScript installation
npm install --save-dev typescript

# Try compiling again
npm run build
```

### Issue: Invalid JWT Secret

**Error Message**: `Token invalid` or `JsonWebTokenError`

**Solution**:
1. Ensure `JWT_SECRET` is set in `.env`
2. Check for extra spaces in `.env`
3. Restart the server after changing `.env`

```env
JWT_SECRET=your-secret-key-here
# Make sure there are no leading/trailing spaces
```

### Issue: CORS Error in Frontend

**Error Message**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
CORS is already enabled in the code. If still having issues:
1. Ensure frontend is making requests to `http://localhost:5000/api/...`
2. Check browser console for specific error
3. Verify headers include `Content-Type: application/json`

### Issue: npm start vs npm run dev

**npm run dev** (Development):
- Use this during development
- Auto-reloads on file changes
- Better for debugging

**npm start** (Production):
- Use after running `npm run build`
- Runs compiled JavaScript
- Better for deployment

---

## Project Structure Walkthrough

### Entry Point: server.ts

```typescript
// Entry file that starts the application
// - Initializes Express app
// - Connects to MongoDB
// - Starts HTTP server on specified PORT
```

### Folder: controllers/

```
authController.ts   → Handles user registration and login
taskController.ts   → Handles task CRUD operations
```

### Folder: models/

```
User.ts   → User schema definition
Task.ts   → Task schema definition
```

### Folder: routes/

```
authRoutes.ts   → Routes for /api/auth/*
taskRoutes.ts   → Routes for /api/tasks/*
```

### Folder: middleware/

```
authMiddleware.ts   → JWT verification middleware
```

### Folder: config/

```
db.ts   → Database configuration (not actively used)
```

---

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Make Code Changes
Edit any files in `src/` folder

### 3. Server Auto-Reloads
Changes are automatically reflected

### 4. Test Your Changes
Use Postman or curl to test endpoints

### 5. Debug Issues
Check terminal logs for errors

### 6. Commit Code
```bash
git add .
git commit -m "Your message"
git push
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Update `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use `MONGO_URI` pointing to production MongoDB
- [ ] Set `PORT` to desired production port
- [ ] Run `npm run build`
- [ ] Test with `npm start`
- [ ] Set up environment variables on server
- [ ] Configure HTTPS/SSL
- [ ] Set up process manager (PM2, systemd, etc.)
- [ ] Configure reverse proxy (Nginx, Apache)
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Set up automated backups

---

## Useful Resources

- **Express Documentation**: https://expressjs.com/
- **Mongoose Documentation**: https://mongoosejs.com/
- **MongoDB Documentation**: https://docs.mongodb.com/
- **JWT Documentation**: https://jwt.io/
- **bcryptjs Documentation**: https://www.npmjs.com/package/bcryptjs
- **TypeScript Documentation**: https://www.typescriptlang.org/

---

## Next Steps

After successful installation:

1. **Read API Documentation**: Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
2. **Understand Code**: Check [CODE_DOCUMENTATION.md](CODE_DOCUMENTATION.md)
3. **Quick Reference**: Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
4. **Start Development**: Modify code in `src/` folder
5. **Test Endpoints**: Use Postman or curl
6. **Add Features**: Extend the application

---

## Getting Help

If you encounter issues:

1. **Check error message** in terminal
2. **Review this guide** - your issue might be covered above
3. **Check API Documentation** for endpoint details
4. **Check Code Documentation** for implementation details
5. **Google the error** - search StackOverflow for similar issues
6. **Check GitHub Issues** if using a shared repository

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check Node version
node --version

# Check npm version
npm --version

# Check installed packages
npm list

# View environment variables
cat .env

# Test API endpoint
curl http://localhost:5000/api
```

---

**Setup Guide Last Updated**: April 25, 2026  
**Node.js Tested Version**: 16.x and above  
**MongoDB Tested Version**: 5.x and above
