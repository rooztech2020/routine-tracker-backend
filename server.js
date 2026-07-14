// server.js (Complete with Debug Logging)
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Progress = require("./models/Progress");

const app = express();
app.use(cors());
app.use(express.json());

// 1. GLOBAL REQUEST LOGGER: This logs every single request hitting your server!
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
console.log("Attempting to connect to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("SUCCESS: MongoDB Connected Successfully"))
  .catch((err) => console.error("ERROR connecting to MongoDB:", err));

// GET: Fetch progress history for a user
app.get("/api/progress/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(`[GET] Route hit! Fetching history for userId: ${userId}`);

  try {
    const history = await Progress.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    console.log(
      `[GET] Successfully fetched ${history.length} records for ${userId}`,
    );
    res.json(history);
  } catch (err) {
    console.error(`[GET] Error fetching for ${userId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST: Update or create today's progress
app.post("/api/progress/:userId", async (req, res) => {
  const { userId } = req.params;
  const { date, tasks, percentage } = req.body;
  console.log(
    `[POST] Route hit! Updating progress for userId: ${userId} on date: ${date}`,
  );
  console.log(`[POST] Payload received:`, { tasks, percentage });

  try {
    const updatedProgress = await Progress.findOneAndUpdate(
      { userId, date },
      { tasks, percentage },
      { new: true, upsert: true },
    );

    console.log(`[POST] Successfully saved/updated record for ${userId}`);
    res.json(updatedProgress);
  } catch (err) {
    console.error(`[POST] Error saving for ${userId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
