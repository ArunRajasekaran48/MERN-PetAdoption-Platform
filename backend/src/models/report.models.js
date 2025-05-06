import mongoose, { Schema } from "mongoose";

const ReportSchema = new Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending","action_taken","declined"],
    default: "pending",
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Report = mongoose.model("Report", ReportSchema);
