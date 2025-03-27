import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
cloudinary.config({ 
    cloud_name: process.env.cloudinary_cloud_name, 
    api_key: process.env.cloudinary_api_key, 
    api_secret: process.env.cloudinary_api_secret
});

const uploadCloudinary = async (localFilePath, folderName = "pet_images") => {
    try {
        if (!localFilePath) {
            console.error('No local file path provided');
            return null;
        }

        // Ensure the file exists
        try {
            fs.accessSync(localFilePath, fs.constants.F_OK);
        } catch (accessError) {
            console.error('File does not exist:', localFilePath);
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: folderName,
            resource_type: "auto"
        });

        // console.log('Full Cloudinary Upload Response:', {
        //     url: response.url,
        //     secure_url: response.secure_url,
        //     public_id: response.public_id
        // });

        // Remove local file
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);

        // Attempt to remove local file
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkError) {
            console.warn('Could not delete local file:', unlinkError);
        }

        return null;
    }
};

export {uploadCloudinary}