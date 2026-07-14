// server.js (Complete)
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Progress = require("./models/Progress");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// GET: Fetch progress history for a user
app.get("/api/progress/:userId", async (req, res) => {
  try {
    // Get the last 30 days of data for the habit tracker
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
    // findOneAndUpdate with upsert: true means it will update today's record,
    // or create a new one if it doesn't exist yet!
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
