import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import cors from "cors";
const verifyJWT = async (req, res, next) => {
    try {
        // Only read token from cookies
        const token = req.cookies.accessToken;
        if (!token) {
            throw new ApiError(401, "No authentication token found. Please login again.");
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password");
        if (!user) throw new ApiError(401, "Unauthorized!");
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(error.statuscode || 500).json({
            statuscode: error.statuscode || 500,
            message: error.message || "Authorization Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
}
export { verifyJWT }