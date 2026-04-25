import { Response } from "express"
import Task from "../models/Task"
import { AuthRequest } from "../middleware/authMiddleware"

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, sort, page = "1", limit = "10" } = req.query

    const query: any = { user: req.userId }

    if (status === "complete") query.completed = true
    if (status === "incomplete") query.completed = false

    if (search) {
      query.title = { $regex: search, $options: "i" }
    }

    const pageNumber = parseInt(page as string)
    const limitNumber = parseInt(limit as string)
    const skip = (pageNumber - 1) * limitNumber

    let tasksQuery = Task.find(query)

    if (sort) {
      tasksQuery = tasksQuery.sort({ [sort as string]: 1 })
    }

    const tasks = await tasksQuery.skip(skip).limit(limitNumber)

    const total = await Task.countDocuments(query)

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

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body

    const task = await Task.create({
      title,
      user: req.userId
    })

    res.status(201).json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, completed } = req.body

    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    if (title !== undefined) {
      task.title = title
    }

    if (completed !== undefined) {
      task.completed = completed
    }

    await task.save()

    res.json(task)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    await Task.findByIdAndDelete(req.params.id)

    res.json({ message: "Task deleted" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}