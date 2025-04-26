import { Pet } from "../models/pets.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

const createPet = async (req, res) => {
    try {
        const { name, age, breed, species, gender, description, owner } = req.body;

        // Validate required fields
        if (!name || !age || !breed || !species || !gender || !owner) {
            throw new ApiError(400, "Missing required pet information");
        }

        // Validate age
        if (isNaN(age) || age < 0 || age > 30) {
            throw new ApiError(400, "Invalid age. Age must be a number between 0 and 30");
        }

        // Validate image upload
        if (!req.files || req.files.length === 0) {
            throw new ApiError(400, "Please provide at least one image");
        }

        // Limit number of images
        if (req.files.length > 5) {
            throw new ApiError(400, "Maximum 5 images allowed");
        }

        // Upload images to Cloudinary
        const imageUploadPromises = req.files.map(async (file) => {
            try {
                const uploadResult = await uploadCloudinary(file.path, "pet_images");
                console.log('Cloudinary Upload Successfull');

                // Check if uploadResult is valid and has secure_url
                if (uploadResult && uploadResult.secure_url) {
                    return uploadResult.secure_url;
                }
                return null;
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return null;
            }
        });

        // Wait for all uploads to complete
        const imageUrls = (await Promise.all(imageUploadPromises))
            .filter(url => url !== null);

        if (imageUrls.length === 0) {
            throw new ApiError(500, "Failed to upload images");
        }

        // Create pet document
        const pet = new Pet({
            name: name.trim(),
            age: parseInt(age),
            breed: breed.trim(),
            species: species.trim(),
            description: description ? description.trim() : "",
            images: imageUrls,
            owner,
        });

        // Save pet to database
        await pet.save();

        return res.status(201).json(new ApiResponse(201, "Pet Created Successfully", pet));
    } catch (error) {
        console.error('Pet Creation Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const getAllPets = async (req, res) => {
    try {
        const { species, breed, gender, availableOnly, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (species) filter.species = species;
        if (breed) filter.breed = breed;
        if (gender) filter.gender = gender;
        if (availableOnly === 'true') filter.adoptionStatus = 'available';

        const pets = await Pet.find(filter)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        return res.status(200).json(new ApiResponse(200, "Pets fetched successfully", pets));
    } catch (error) {
        console.error('Get Pets Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const getPetById = async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await Pet.findById(id);
        if (!pet) throw new ApiError(404, "Pet not found");

        return res.status(200).json(new ApiResponse(200, "Pet fetched successfully", pet));
    } catch (error) {
        console.error('Get Pet By Id Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const updatePet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, breed, species, description, gender } = req.body;

        const pet = await Pet.findById(id);
        if (!pet) throw new ApiError(404, "Pet not found");

        if (name) pet.name = name.trim();
        if (age) pet.age = parseInt(age);
        if (breed) pet.breed = breed.trim();
        if (species) pet.species = species.trim();
        if (description) pet.description = description.trim();
        if (gender) pet.gender = gender;

        await pet.save();

        return res.status(200).json(new ApiResponse(200, "Pet updated successfully", pet));
    } catch (error) {
        console.error('Update Pet Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const deletePet = async (req, res) => {
    try {
        const { id } = req.params;

        const pet = await Pet.findById(id);
        if (!pet) throw new ApiError(404, "Pet not found");

        await Pet.findByIdAndDelete(id);

        return res.status(200).json(new ApiResponse(200, "Pet deleted successfully", null));
    } catch (error) {
        console.error('Delete Pet Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const updateAdoptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // status: 'available', 'pending', 'adopted'

        const validStatuses = ['available', 'pending', 'adopted'];
        if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid adoption status");

        const pet = await Pet.findById(id);
        if (!pet) throw new ApiError(404, "Pet not found");

        pet.adoptionStatus = status;
        await pet.save();

        return res.status(200).json(new ApiResponse(200, "Adoption status updated", pet));
    } catch (error) {
        console.error('Update Adoption Status Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const getPetsByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;

        const pets = await Pet.find({ owner: ownerId });

        return res.status(200).json(new ApiResponse(200, "Pets fetched successfully", pets));
    } catch (error) {
        console.error('Get Pets By Owner Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

const updatePetImages = async (req, res) => {
    try {
        const { id } = req.params;
        const { replace } = req.body; // Optional: replace = "true" to replace

        const pet = await Pet.findById(id);
        if (!pet) throw new ApiError(404, "Pet not found");

        if (!req.files || req.files.length === 0) {
            throw new ApiError(400, "Please provide at least one image");
        }

        if (req.files.length > 5) {
            throw new ApiError(400, "Maximum 5 images allowed");
        }

        const imageUploadPromises = req.files.map(async (file) => {
            const result = await uploadCloudinary(file.path, "pet_images");
            if (result && result.secure_url) return result.secure_url;
            return null;
        });

        const imageUrls = (await Promise.all(imageUploadPromises)).filter(url => url !== null);

        if (imageUrls.length === 0) {
            throw new ApiError(500, "Image upload failed");
        }

        if (replace === 'true') {
            pet.images = imageUrls;
        } else {
            pet.images = [...pet.images, ...imageUrls].slice(0, 5); // Max 5
        }

        await pet.save();

        return res.status(200).json(new ApiResponse(200, "Pet images updated", pet));
    } catch (error) {
        console.error('Update Pet Images Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
};

export {createPet,getAllPets,getPetById,deletePet,updatePet,updateAdoptionStatus,getPetsByOwner,updatePetImages};

