import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"

import authRoutes from "./routes/authRoutes"
import taskRoutes from "./routes/taskRoutes"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

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

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("MongoDB connected")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => console.log(error))