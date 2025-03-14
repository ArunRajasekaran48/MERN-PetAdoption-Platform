import {User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
const generateAccesstoken = async (userId)=>{
    try {
        const user= await User.findById(userId)
        if(!user){
            throw new ApiError(409,"User Not Found");
        }
        const accessToken=user.generateAccesstoken()
        await user.save({validateBeforeSave:false})
        return accessToken;
    } catch (error) {
        throw new ApiError(500,"Something went Wrong while generating AccessToken!")
    }
} 

const registerUser= async (req,res)=>{

    try {
        //Validations
        // 1.Empty fiels
        const { name, email, password,phone,role } = req.body;
        if([name,email,password,phone,role].some(
            (field)=>field?.trim()===""
        )){
            throw new ApiError(400,"Please Provide All Credentials")
        }
        //2.Existing user 
        const existingUser=await User.findOne({
            $or:[{email},{name}]
        });

        if(existingUser){
            throw new ApiError(409,"Registered User Already Exists!")
        }

        const user=await User.create({name,email,password,phone,role})
       const createdUser=await User.findById(user._id).select("-password -phone")
        if(!createdUser){
            throw new ApiError(500,"Something Went Wrong! While reg a user!")
        }
        return res.
        status(200)
        .json(new ApiResponse(200,createdUser,"User Registered Successfully"))

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(error.statuscode || 500).json({
            statuscode: error.statuscode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }    
}

const loginUser= async (req,res)=>{

    try {
        const {name,email,password}=req.body
        if(!email || !password || !name)throw new ApiError(400,"Please Enter all credentials")
        
        const user= await User.findOne({
            $or:[{name},{email}]
        })

        if(!user)throw new ApiError(400,"User Not Found!")
        const isPasswordValid=await user.isPasswordCorrect(password)
        if(!isPasswordValid)throw new ApiError(500,"Invalid Credentials!")

        const accessToken=await generateAccesstoken(user._id)
        const loggedInUser=await User.findById(user._id).select("-password ")
        if(!loggedInUser)throw new ApiError(409,"Error Logging user")
        console.log(accessToken);
        return res
        .status(200)
        .cookie("accessToken",accessToken)
        .json(new ApiResponse(200,loggedInUser,"User Logged in Successfully!!"))

    } catch (error) {
        console.error('Login error:', error);
        return res.status(error.statuscode || 500).json({
            statuscode: error.statuscode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }    
}

const logoutUser= async (req,res)=>{
   try {
    return res
    .status(200)
    .clearCookie("accessToken")
    .json(new ApiResponse(200,"User Logged Out Successfully!!"))
   } catch (error) {
        console.log(error);
   }
}

const refreshAccessToken=async (req,res)=>{
    try {
        const incomingAccessToken=req.cookies.accessToken || req.body.accessToken
        if(!incomingAccessToken)throw new ApiError(401,"Access Token is Required");
       const decodedToken= jwt.verify(
            incomingAccessToken,
            process.env.JWT_SECRET
        )
       const user= await User.findById(decodedToken?._id)
       if(!user)throw new ApiError(401,"Invalid AccesssToken");

       const newAccessToken=await generateAccesstoken(user._id)
       return res
       .status(200)
       .cookie("accesstoken",newAccessToken)
       .json(
        new ApiResponse(200,newAccessToken,"AccessToken refreshed successfully")
       ) 
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(error.statuscode || 500).json({
            statuscode: error.statuscode || 500,
            message: error.message || "Internal Server Error",
            data: null,
            success: false,
            errors: error.errors || []
        });
    }
    
}
export {registerUser,loginUser,refreshAccessToken,logoutUser}
