import { ReviewReport } from "../models/report.models.js";
import { Review } from "../models/reviews.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// User creates a review report
export const createReviewReport = async (req, res) => {
  try {
    const { review, reason } = req.body;
    const reportedBy = req.user._id;
    if (!review || !reason) throw new ApiError(400, "Missing required fields");
    const report = await ReviewReport.create({ review, reportedBy, reason });
    return res.status(201).json(new ApiResponse(201, report, "Review report submitted successfully"));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal Server Error",
      data: null,
      success: false,
      errors: error.errors || []
    });
  }
};

// Admin: get all review reports
export const getAllReviewReports = async (req, res) => {
  try {
    const reports = await ReviewReport.find()
      .populate({
        path: "review",
        populate: { path: "userId", select: "name email" }
      })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, reports, "Review reports fetched successfully"));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal Server Error",
      data: null,
      success: false,
      errors: error.errors || []
    });
  }
};

// Admin: update review report status
export const updateReviewReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) throw new ApiError(400, "Status required");
    const report = await ReviewReport.findByIdAndUpdate(id, { status }, { new: true });
    if (!report) throw new ApiError(404, "Review report not found");
    return res.status(200).json(new ApiResponse(200, report, "Review report status updated"));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal Server Error",
      data: null,
      success: false,
      errors: error.errors || []
    });
  }
}; 