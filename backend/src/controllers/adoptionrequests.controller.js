import { AdoptionRequest } from "../models/adoptionrequests.models.js";
import  {Pet}  from "../models/pets.models.js";
import  {User}  from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createAdoptionRequest = async (req, res) => {
    try {
        const { userId, petId } = req.body;

        // Validate required fields
        if (!userId || !petId) {
            throw new ApiError(400, "Missing required fields: userId and petId");
        }

        // Check if pet exists and is available
        const pet = await Pet.findById(petId);
        if (!pet) {
            throw new ApiError(404, "Pet not found");
        }
        if (pet.adoptionStatus !== 'available') {
            throw new ApiError(400, "Pet is not available for adoption");
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (pet.owner.toString() === userId) {
            throw new ApiError(400, "You cannot adopt your own pet");
        }

        // Check if request already exists
        const existingRequest = await AdoptionRequest.findOne({ userId, petId });
        if (existingRequest) {
            throw new ApiError(400, "Adoption request already exists");
        }

        // Create adoption request
        const adoptionRequest = new AdoptionRequest({
            userId,
            petId,
            status: 'pending'
        });

        // Update pet status to pending
        pet.adoptionStatus = 'pending';
        await pet.save();

        await adoptionRequest.save();
        return res.status(201).json(new ApiResponse(201, "Adoption request created successfully", adoptionRequest));
    } catch (error) {
        console.error('Create Adoption Request Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const getAllAdoptionRequests = async (req, res) => {
    try {
        const { status, userId, petId, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (userId) filter.userId = userId;
        if (petId) filter.petId = petId;
        const requests = await AdoptionRequest.find(filter)
            .populate('userId', 'name email phone')
            .populate('petId', 'name species breed')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        return res.status(200).json(new ApiResponse(200, "Adoption requests fetched successfully", requests));
    } catch (error) {
        console.error('Get Adoption Requests Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const getAdoptionRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await AdoptionRequest.findById(id)
            .populate('userId', 'name email')
            .populate('petId', 'name species breed');

        if (!request) {
            throw new ApiError(404, "Adoption request not found");
        }

        return res.status(200).json(new ApiResponse(200, "Adoption request fetched successfully", request));
    } catch (error) {
        console.error('Get Adoption Request By Id Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

 const updateAdoptionRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, "Invalid status. Must be one of: pending, approved, rejected");
        }

        const request = await AdoptionRequest.findById(id);
        if (!request) {
            throw new ApiError(404, "Adoption request not found");
        }
         // Get the pet to check ownership
         const pet = await Pet.findById(request.petId);
         if (!pet) {
             throw new ApiError(404, "Pet not found");
         }
         // Check if the pet owner is the same as the user
         if (pet.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Only the pet owner can update the adoption request status");
        }
        // Only allow status updates if the request is pending
        if (request.status !== 'pending' && status !== request.status) {
            throw new ApiError(400, "Cannot update status of a non-pending request");
        }

        // If approving, update pet status to adopted
        if (status === 'approved') {
            const pet = await Pet.findById(request.petId);
            if (!pet) {
                throw new ApiError(404, "Pet not found");
            }
            pet.adoptionStatus = 'adopted';
            await pet.save();
            request.approvedAt = new Date();
        }

        request.status = status;
        await request.save();

        return res.status(200).json(new ApiResponse(200, "Adoption request status updated successfully", request));
    } catch (error) {
        console.error('Update Adoption Request Status Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const deleteAdoptionRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await AdoptionRequest.findById(id);
        if (!request) {
            throw new ApiError(404, "Adoption request not found");
        }
        // Get the pet to check ownership
        const pet = await Pet.findById(request.petId);
        if (!pet) {
            throw new ApiError(404, "Pet not found");
        }

        // Check if the current user is the pet owner
        if (pet.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "Only the pet owner can delete the adoption request");
        }

        // If request is pending, update pet status back to available
        if (request.status === 'pending') {
            const pet = await Pet.findById(request.petId);
            if (pet) {
                pet.adoptionStatus = 'available';
                await pet.save();
            }
        }

        await AdoptionRequest.findByIdAndDelete(id);

        return res.status(200).json(new ApiResponse(200, "Adoption request deleted successfully", null));
    } catch (error) {
        console.error('Delete Adoption Request Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

// Get all outgoing adoption requests (requests made by the user)
const getOutgoingAdoptionRequests = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from authenticated user
        const { status } = req.query;
        const filter = { userId };

        if (status) filter.status = status;

        const requests = await AdoptionRequest.find(filter)
            .populate({
                path: 'petId',
                select: 'name species breed age images owner',
                populate: {
                    path: 'owner',
                    select: 'name email phone'
                }
            })
            .sort({ requestedAt: -1 }); // Sort by most recent first

        return res.status(200).json(new ApiResponse(200, requests, "Outgoing adoption requests fetched successfully"));
    } catch (error) {
        console.error('Get Outgoing Adoption Requests Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

// Get all incoming adoption requests (requests for user's pets)
const getIncomingAdoptionRequests = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID from authenticated user
        const { status } = req.query;

        // First find all pets owned by the user
        const userPets = await Pet.find({ owner: userId });
        const petIds = userPets.map(pet => pet._id);

        const filter = { petId: { $in: petIds } };
        if (status) filter.status = status;

        const requests = await AdoptionRequest.find(filter)
            .populate({
                path: 'petId',
                select: 'name species breed age images owner',
                populate: {
                    path: 'owner',
                    select: 'name email phone'
                }
            })
            .populate('userId', 'name email phone address')
            .sort({ requestedAt: -1 }); // Sort by most recent first

        return res.status(200).json(new ApiResponse(200, requests, "Incoming adoption requests fetched successfully"));
    } catch (error) {
        console.error('Get Incoming Adoption Requests Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

export { createAdoptionRequest, getAllAdoptionRequests, getAdoptionRequestById, updateAdoptionRequestStatus, deleteAdoptionRequest, getOutgoingAdoptionRequests, getIncomingAdoptionRequests};