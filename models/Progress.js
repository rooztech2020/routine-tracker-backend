const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // E.g., 'my_sync_id'
  date: { type: String, required: true }, // E.g., '2026-07-14'
  tasks: { type: Map, of: Boolean, default: {} }, // Checkbox states
  percentage: { type: Number, default: 0 },
});

// Compound index so a user only has one record per day
ProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);
