// models/Progress.js
import mongoose from "mongoose/lib/index.js";

const ProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  tasks: { type: Map, of: Boolean, default: {} },
  percentage: { type: Number, default: 0 },
});

ProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

const Progress =
  mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);

export default Progress;
