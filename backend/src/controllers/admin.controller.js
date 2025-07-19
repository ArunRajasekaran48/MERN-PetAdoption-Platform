import { User } from "../models/user.models.js";
import { Pet } from "../models/pets.models.js";
import { Review } from "../models/reviews.models.js";
import { AdoptionRequest } from "../models/adoptionrequests.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Dashboard Stats Overview
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'User' });
        const totalPets = await Pet.countDocuments();
        const totalApprovedAdoptionRequests = await AdoptionRequest.countDocuments({status:"approved"});
        const totalRejectedAdoptionRequests = await AdoptionRequest.countDocuments({status:"rejected"});
        const totalPendingAdoptionRequests = await AdoptionRequest.countDocuments({status:"pending"});
        const totalReviews = await Review.countDocuments();
        const stats = {
            totalUsers,
            totalPets,
            totalApprovedAdoptionRequests,
            totalRejectedAdoptionRequests,
            totalPendingAdoptionRequests,
            totalReviews,
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
        const users = await User.find({ role: 'User' })
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

const deleteUser = async(req,res)=>{
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404,"User not found");
        }
        await User.findByIdAndDelete(userId);
        return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
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

// Suspend a user for a number of days
const suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { days } = req.body;
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");
        if (user.role === 'Admin') throw new ApiError(403, "Cannot suspend an admin user");
        if (!days || isNaN(days) || days < 1) throw new ApiError(400, "Invalid suspension days");
        user.suspendedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        user.isBanned = false;
        user.banReason = null;
        await user.save();
        return res.status(200).json(new ApiResponse(200, user, `User suspended for ${days} days`));
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

// Ban a user permanently
const banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");
        if (user.role === 'Admin') throw new ApiError(403, "Cannot ban an admin user");
        user.isBanned = true;
        user.banReason = reason || null;
        user.suspendedUntil = null;
        await user.save();
        return res.status(200).json(new ApiResponse(200, user, "User banned permanently"));
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

// Unban or unsuspend a user
const unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");
        user.isBanned = false;
        user.banReason = null;
        user.suspendedUntil = null;
        await user.save();
        return res.status(200).json(new ApiResponse(200, user, "User unbanned/unsuspended successfully"));
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

        // Delete related adoption requests
        await AdoptionRequest.deleteMany({ petId });

        // Delete related reviews
        await Review.deleteMany({ petId });

        // Now delete the pet
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


export {getDashboardStats,getAllUsers,getAllPetListings,removePetListing,getAllReviews,deleteReview,deleteUser,
    suspendUser, banUser, unbanUser};
