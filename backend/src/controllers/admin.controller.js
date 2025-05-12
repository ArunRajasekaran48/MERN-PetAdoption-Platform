import { User } from "../models/user.models.js";
import { Pet } from "../models/pets.models.js";
import { Review } from "../models/reviews.models.js";
import { AdoptionRequest } from "../models/adoptionrequests.models.js";
import { Report } from "../models/report.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Dashboard Stats Overview
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'adopter' });
        const totalPets = await Pet.countDocuments();
        const totalAdoptionRequests = await AdoptionRequest.countDocuments();
        const totalReviews = await Review.countDocuments();
        const recentAdoptionRequests = await AdoptionRequest.find()
            .sort({ requestedAt: -1 })
            .limit(5)
            .populate('userId', 'name email')
            .populate('petId', 'name species');

        const stats = {
            totalUsers,
            totalPets,
            totalAdoptionRequests,
            totalReviews,
            recentAdoptionRequests
        };

        return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats retrieved successfully"));
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

// User Management
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'adopter' })
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, users, "Users retrieved successfully"));
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

const toggleUserBlock = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (user.role === 'admin') {
            throw new ApiError(403, "Cannot block an admin user");
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        return res.status(200).json(new ApiResponse(200, user, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`));
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

// Pet Listing Management
const getAllPetListings = async (req, res) => {
    try {
        const pets = await Pet.find()
            .populate('owner', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, pets, "Pet listings retrieved successfully"));
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

const removePetListing = async (req, res) => {
    try {
        const { petId } = req.params;
        const pet = await Pet.findById(petId);

        if (!pet) {
            throw new ApiError(404, "Pet listing not found");
        }

        await Pet.findByIdAndDelete(petId);

        return res.status(200).json(new ApiResponse(200, null, "Pet listing removed successfully"));
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

// Review Moderation
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'name email')
            .populate('petId', 'name species')
            .sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, reviews, "Reviews retrieved successfully"));
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

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            throw new ApiError(404, "Review not found");
        }

        await Review.findByIdAndDelete(reviewId);

        return res.status(200).json(new ApiResponse(200, null, "Review deleted successfully"));
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

// Report Management
const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("reporterId", "name email")
            .populate("reportedUserId", "name email")
            .populate("reviewId")
            .sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, reports, "All reports fetched successfully"));
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

const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;

        if (!['pending', 'action_taken', 'declined'].includes(status)) {
            throw new ApiError(400, "Invalid status. Must be one of: pending, action_taken, declined");
        }

        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { status },
            { new: true }
        ).populate("reporterId", "name email")
         .populate("reportedUserId", "name email")
         .populate("reviewId");

        if (!updatedReport) {
            throw new ApiError(404, "Report not found");
        }

        return res.status(200).json(new ApiResponse(200, updatedReport, "Report status updated successfully"));
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

export {getDashboardStats,getAllUsers,toggleUserBlock,getAllPetListings,removePetListing,getAllReviews,deleteReview,getAllReports,updateReportStatus};
