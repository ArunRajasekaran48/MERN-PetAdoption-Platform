import { Report } from "../models/report.models.js";
import { User } from "../models/user.models.js";
import { Pet } from "../models/pets.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// User creates a report
export const createReport = async (req, res) => {
  try {
    const { reportedUser, pet, reason } = req.body;
    const reportedBy = req.user._id;
    if (!reportedUser || !pet || !reason) throw new ApiError(400, "Missing required fields");
    const report = await Report.create({ reportedUser, reportedBy, pet, reason });
    return res.status(201).json(new ApiResponse(201, report, "Report submitted successfully"));
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

// Admin: get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reportedUser", "name email")
      .populate("reportedBy", "name email")
      .populate("pet", "name breed")
      .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, reports, "Reports fetched successfully"));
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

// Admin: update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) throw new ApiError(400, "Status required");
    const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
    if (!report) throw new ApiError(404, "Report not found");
    return res.status(200).json(new ApiResponse(200, report, "Report status updated"));
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