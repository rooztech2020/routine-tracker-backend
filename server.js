// server.js (Cloudflare-safe)
import express from "express";
// Crucial fix: Import directly from the lib entry point to prevent Mongoose from loading browser polyfills
import mongoose from "mongoose/lib/index.js";
import cors from "cors";
import { httpServerHandler } from "cloudflare:node";
import Progress from "./models/Progress.js";

const app = express();
app.use(cors());
app.use(express.json());

// Create a database connection helper that only runs when a request comes in
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("SUCCESS: Connected to MongoDB");
  } catch (err) {
    console.error("ERROR: Failed to connect to MongoDB:", err.message);
    throw err;
  }
};

// Middleware to ensure DB connection exists before executing any route
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// GET: Fetch progress history for a user
app.get("/api/progress/:userId", async (req, res) => {
  try {
    const history = await Progress.find({ userId: req.params.userId })
      .sort({ date: -1 })
      .limit(30);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Update or create today's progress
app.post("/api/progress/:userId", async (req, res) => {
  const { date, tasks, percentage } = req.body;
  try {
    const updatedProgress = await Progress.findOneAndUpdate(
      { userId: req.params.userId, date: date },
      { tasks, percentage },
      { new: true, upsert: true },
    );
    res.json(updatedProgress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export the cloudflare handler
export default httpServerHandler(app);
