import { ApiError } from "../utils/ApiError.js";

const verifyAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            throw new ApiError(403, "Access denied. Admin privileges required.");
        }
        next();
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

export { verifyAdmin }; 