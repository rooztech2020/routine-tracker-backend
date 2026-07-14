// server.js (Cloudflare Global-Scope Safe)
import express from "express";
import cors from "cors";
import { httpServerHandler } from "cloudflare:node";

const app = express();
app.use(cors());
app.use(express.json());

// These are declared globally but will remain uninitialized until the first request hits!
let mongoose;
let Progress;
let isConnected = false;

const initAndConnectDB = async () => {
  if (isConnected) return;

  try {
    // Dynamic Imports: By moving imports inside this function, Cloudflare compiles
    // MongoDB and Mongoose only inside the request handler context!
    if (!mongoose) {
      const mongooseModule = await import("mongoose/lib/index.js");
      mongoose = mongooseModule.default;
    }

    if (!Progress) {
      const progressModule = await import("./models/Progress.js");
      Progress = progressModule.default;
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("SUCCESS: Securely connected to MongoDB");
  } catch (err) {
    console.error(
      "ERROR: Failed to establish database connection:",
      err.message,
    );
    throw err;
  }
};

// Middleware: Automatically init modules & establish DB connection before each route runs
app.use(async (req, res, next) => {
  try {
    await initAndConnectDB();
    next();
  } catch (err) {
    res
      .status(500)
      .json({ error: "Database connection or initialization failed" });
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

export default httpServerHandler(app);
