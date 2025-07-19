import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema({
  reportedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  pet: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export const Report = mongoose.model("Report", reportSchema);

// Review Report Model

const reviewReportSchema = new Schema({
  review: { type: Schema.Types.ObjectId, ref: "Review", required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export const ReviewReport = mongoose.model("ReviewReport", reviewReportSchema); 