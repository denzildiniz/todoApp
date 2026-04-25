# Quick Reference Guide

## Project at a Glance

**Project**: Todo/Task Management API  
**Stack**: Express.js, TypeScript, MongoDB, JWT  
**Purpose**: Manage user tasks with authentication

---

## File Structure Quick Reference

```
backend/
├── src/
│   ├── server.ts              ← Main entry point
│   ├── config/
│   │   └── db.ts              ← Database setup
│   ├── controllers/
│   │   ├── authController.ts  ← Login/Register logic
│   │   └── taskController.ts  ← Task CRUD logic
│   ├── middleware/
│   │   └── authMiddleware.ts  ← JWT verification
│   ├── models/
│   │   ├── User.ts            ← User schema
│   │   └── Task.ts            ← Task schema
│   └── routes/
│       ├── authRoutes.ts      ← Auth endpoints
│       └── taskRoutes.ts      ← Task endpoints
├── package.json
├── tsconfig.json
└── .env (create this)
```

---

## Setup Checklist

- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file with environment variables
- [ ] Ensure MongoDB is running
- [ ] Start dev server: `npm run dev`
- [ ] Test with `curl` or Postman

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/todo-app
JWT_SECRET=your-super-secret-key-change-this
```

---

## NPM Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start with auto-reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production |

---

## API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| **GET** | `/api` | ❌ | API info |
| **POST** | `/api/auth/register` | ❌ | Create account |
| **POST** | `/api/auth/login` | ❌ | Get token |
| **GET** | `/api/tasks` | ✅ | Get user's tasks |
| **POST** | `/api/tasks` | ✅ | Create task |
| **PATCH** | `/api/tasks/:id` | ✅ | Update task |
| **DELETE** | `/api/tasks/:id` | ✅ | Delete task |

---

## Database Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String,
  completed: Boolean,
  user: ObjectId (references User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication Flow

1. **Register**: POST `/api/auth/register` → User created
2. **Login**: POST `/api/auth/login` → JWT token received
3. **Use Token**: Add to header: `Authorization: Bearer <token>`
4. **Access Protected Routes**: Token verified by middleware
5. **Token Expires**: After 24 hours, login again

---

## Sample Request/Response

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
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

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
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

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries"
  }'
```

Response:
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

### Get Tasks
```bash
curl -X GET "http://localhost:5000/api/tasks" \
  -H "Authorization: Bearer <your_token>"
```

Response:
```json
{
  "total": 5,
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

### Update Task
```bash
curl -X PATCH http://localhost:5000/api/tasks/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

### Delete Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer <your_token>"
```

---

## Debugging Tips

### Check MongoDB Connection
```bash
# If you get "MongoDB connection error"
# 1. Ensure MongoDB is running
# 2. Check MONGO_URI in .env
# 3. Verify network access
```

### Invalid Token Error
```bash
# 1. Token may have expired (24-hour limit)
# 2. JWT_SECRET mismatch
# 3. Token format must be: "Bearer <token>"
```

### Port Already in Use
```bash
# Change PORT in .env or kill process
# Linux/Mac: lsof -i :5000 | kill -9 <PID>
# Windows: netstat -ano | findstr :5000
```

### CORS Issues
```bash
# CORS is enabled in server.ts
# If still issues, check:
# 1. Frontend URL is allowed
# 2. Credentials header included
```

---

## Status Codes Quick Reference

| Code | Meaning | Common Reason |
|------|---------|---------------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Server issue |

---

## Testing Checklist

- [ ] Register new user
- [ ] Login and get token
- [ ] Create a task
- [ ] Get all tasks
- [ ] Get tasks with filters (status, search)
- [ ] Update task (title or completion status)
- [ ] Delete task
- [ ] Test with expired/invalid token (should fail)
- [ ] Test pagination (page, limit)

---

## Performance Query Examples

### Get Incomplete Tasks
```bash
GET /api/tasks?status=incomplete
```

### Search Tasks
```bash
GET /api/tasks?search=project
```

### Pagination (2nd page, 10 items)
```bash
GET /api/tasks?page=2&limit=10
```

### Combined Filters
```bash
GET /api/tasks?status=incomplete&search=bug&page=1&limit=5
```

---

## Important Security Notes

1. **JWT Secret**: Change `JWT_SECRET` in production
2. **HTTPS**: Use HTTPS in production (not HTTP)
3. **CORS**: Restrict origins in production
4. **Password**: Never log or return passwords
5. **Token Expiry**: Tokens expire after 24 hours
6. **Rate Limiting**: Consider adding to prevent abuse

---

## Future Improvements

- [ ] Input validation middleware
- [ ] Request rate limiting
- [ ] Swagger/OpenAPI documentation
- [ ] Unit tests with Jest
- [ ] Database indexes
- [ ] Error logging
- [ ] User profile endpoint
- [ ] Task categories
- [ ] Task due dates
- [ ] Email notifications

---

## Key Dependencies Explained

| Package | Purpose | Version |
|---------|---------|---------|
| `express` | Web framework | 5.2.1 |
| `mongoose` | MongoDB ODM | 9.5.0 |
| `jsonwebtoken` | JWT creation/verification | 9.0.3 |
| `bcryptjs` | Password hashing | 3.0.3 |
| `cors` | Cross-origin support | 2.8.6 |
| `dotenv` | Environment variables | 17.4.2 |

---

## Useful MongoDB Commands

```javascript
// Count users
db.users.countDocuments()

// Find user by email
db.users.findOne({ email: "john@example.com" })

// Get user's tasks
db.tasks.find({ user: ObjectId("...") })

// Count completed tasks
db.tasks.countDocuments({ completed: true })

// Delete all tasks
db.tasks.deleteMany({})

// Add index on email for faster queries
db.users.createIndex({ email: 1 })
```

---

## Common Code Patterns

### Async Function with Error Handling
```typescript
export const someHandler = async (req: Request, res: Response) => {
  try {
    // Your code here
    res.json({ message: "Success" })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}
```

### Protected Route
```typescript
router.post("/path", authMiddleware, controllerFunction)
```

### Query with Filters
```typescript
const query: any = { user: userId }
if (filter) query.field = value
const results = await Model.find(query)
```

### JWT Verification
```typescript
const token = authHeader.split(" ")[1]
const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
```

---

**Quick Reference Last Updated**: April 25, 2026  
**API Version**: 1.0
