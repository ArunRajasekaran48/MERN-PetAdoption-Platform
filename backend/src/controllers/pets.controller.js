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

const getAllPets = async (req,res)=>{
    try {
        const{species,age,breed,gender}=req.body
        const filter = { isAdopted: false }
        if(species)filter.species=species
        if(age)filter.age=age
        if(breed)filter.breed=breed
        if(gender)filter.gender=gender

        const pets=await Pet.find(filter).populate('owner','name,email').sort({createdAt:-1})

        return res.status(200).json(new ApiResponse(200,pets,"Pets Fetched successfully!"))
    }catch (error) {
        console.error('Fetching Error:', error);
        return res.status(error.statusCode || 500).json({
            statusCode: error.statusCode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
}
export {createPet,getAllPets}