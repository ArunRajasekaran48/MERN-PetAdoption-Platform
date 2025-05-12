import { Report } from "../models/report.models.js";
import { ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

        return res.status(201).json(new ApiResponse(201, report, "User reported successfully"));
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

const reportReview = async (req, res) => {
    try {
        const { reviewId, reason } = req.body;
        const reporterId = req.user._id;

        if (!reviewId || !reason) {
            throw new ApiError(400, "reviewId and reason are required");
        }

        const existingReport = await Report.findOne({ reporterId, reviewId });
        if (existingReport) throw new ApiError(400, "You have already reported this review and please wait for the admin to solve this!");

        const report = await Report.create({
            reporterId,
            reviewId,
            reason: reason.trim(),
        });

        return res.status(201).json(new ApiResponse(201, report, "Review reported successfully"));
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

export { reportUser, reportReview }