import { Report } from "../models/report.models";
import { ApiError} from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";


const reportUser = async (req, res) => {
    try {
        const { reportedUserId, reason } = req.body;
        const reporterId = req.user._id;

        if (!reportedUserId || !reason) {
            throw new ApiError(400, "reportedUserId and reason are required");
        }

        if (reportedUserId.toString() === reporterId.toString()) {
            throw new ApiError(400, "You cannot report yourself");
        }

        const existingReport = await Report.findOne({ reporterId, reportedUserId });
        if (existingReport) throw new ApiError(400, "You have already reported this user and please wait for the admin to solve this!");

        const report = await Report.create({
            reporterId,
            reportedUserId,
            reason: reason.trim(),
        });

        return res.status(201).json(new ApiResponse(201, "User reported successfully", report));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
        });
    }
};

const reportReview = async (req, res) => {
    try {
        const { reviewId, reason } = req.body;
        const reporterId = req.user._id;

        if (!reviewId || !reason) {
            throw new ApiError(400, "reviewId and reason are required");
        }

        const existingReport = await Report.findOne({ reporterId, reviewId });
        if (existingReport) throw new ApiError(400, "You have already reported this user and please wait for the admin to solve this!");

        const report = await Report.create({
            reporterId,
            reviewId,
            reason: reason.trim(),
        });

        return res.status(201).json(new ApiResponse(201, "Review reported successfully", report));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
        });
    }
};

const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("reporterId", "name email")
            .populate("reportedUserId", "name email")
            .populate("reviewId")
            .sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, "All reports fetched", reports));
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};

const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { status },
            { new: true }
        );

        if (!updatedReport) throw new ApiError(404, "Report not found");

        return res.status(200).json(new ApiResponse(200, "Report updated", updatedReport));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message,
            success: false,
        });
    }
};

export {reportUser,reportReview,getAllReports,updateReportStatus}