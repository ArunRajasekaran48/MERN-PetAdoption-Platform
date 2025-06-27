import { Review } from "../models/reviews.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";


import mongoose from "mongoose";
const addReview = async (req, res) => {
    try {
        const { petId, rating, comment } = req.body;
        const userId = req.user._id;

        const existingReview = await Review.findOne({ userId, petId });
        if (existingReview) throw new ApiError(400, "You have already reviewed this pet");

        const review = await Review.create({ userId, petId, rating, comment });

        return res.status(201).json(new ApiResponse(201, "Review added", review));
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message, success: false });
    }
};

//Get all reviews with user and pet details including one image
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("userId", "name")
            .populate({
                path: "petId",
                select: "name species",
                populate: {
                    path: "images",
                    select: "url",
                    limit: 1
                }
            });

        return res.status(200).json(new ApiResponse(200, "Reviews fetched", reviews));
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message, success: false });
    }
};


const getReviewsForPet = async (req, res) => {
    try {
        const { petId } = req.params;
        const reviews = await Review.find({ petId }).populate("userId", "name" );

        // Return reviews array in 'data' field, with a message
        return res.status(200).json({
            success: true,
            message: "Reviews fetched",
            data: reviews
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message, success: false });
    }
};

const getAverageRating = async (req, res) => {
    try {
        const { petId } = req.params;

        const result = await Review.aggregate([
            { $match: { petId: new mongoose.Types.ObjectId(petId) } },
            { $group: { _id: "$petId", averageRating: { $avg: "$rating" } } }
        ]);

        const averageRating = result.length > 0 ? result[0].averageRating : 0;

        return res.status(200).json({
            success: true,
            message: "Average rating fetched",
            data: { averageRating }
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message, success: false });
    }
};

const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        const review = await Review.findOneAndUpdate(
            { _id: reviewId, userId }, // ensure the user owns the review
            { rating, comment },
            { new: true }
        );

        if (!review) throw new ApiError(404, "Review not found");

        return res.status(200).json(new ApiResponse(200, "Review updated", review));
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message, success: false });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Review.findOneAndDelete({ _id: reviewId, userId });

        if (!review) {
            throw new ApiError(404, "Review not found or unauthorized");
        }

        return res.status(200).json(new ApiResponse(200, "Review deleted", null));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
        });
    }
};

export {addReview,getReviewsForPet,getAverageRating,updateReview,deleteReview,getReviews};