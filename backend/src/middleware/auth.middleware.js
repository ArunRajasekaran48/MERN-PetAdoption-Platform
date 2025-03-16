import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"

const verifyJWT= async(req,res,next)=>{
   try {
     const token= req.cookies.accessToken || req.header("Authorization").replace("Bearer ","")
     const decodedToken=jwt.verify(token,process.env.JWT_SECRET)
     const user=await User.findById(decodedToken?._id).select("-password")
     if(!user)throw new ApiError(401,"Unauthorized!");
     req.user=user
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
export {verifyJWT}