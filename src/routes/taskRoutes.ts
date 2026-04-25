import express from "express"
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from "../controllers/taskController"

import authMiddleware from "../middleware/authMiddleware"

const router = express.Router()

router.get("/", authMiddleware, getTasks)
router.post("/", authMiddleware, createTask)
router.patch("/:id", authMiddleware, updateTask)
router.delete("/:id", authMiddleware, deleteTask)

export default router