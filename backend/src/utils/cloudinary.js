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

const deleteFromCloudinary= async(publicIds)=>{
    try {
        const destroyPromises = publicIds.map(publicId =>
            cloudinary.uploader.destroy(publicId)
        );
        await Promise.all(destroyPromises);
        console.error('Error deleting images from Cloudinary:', error);
    } catch (error) {
        console.log(error);
        return null;
    }
}
export {uploadCloudinary,deleteFromCloudinary}