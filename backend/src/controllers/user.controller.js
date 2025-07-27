import {User} from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js"
import jwt from "jsonwebtoken"
import crypto from "crypto"
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
        const { name, email, password, phone, role} = req.body;
        if([name,email,password,phone].some(
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
        if(!email || !password)throw new ApiError(400,"Please Enter all credentials")
        
        const user= await User.findOne({
            $or:[{name},{email}]
        })

        if(!user)throw new ApiError(400,"User Not Found!")
        if (user.isBanned) {
            throw new ApiError(403, "Your account has been banned. Please contact support.");
        }
        if (user.suspendedUntil && user.suspendedUntil > new Date()) {
            throw new ApiError(403, `Your account is suspended until ${user.suspendedUntil.toLocaleString()}`);
        }
        const isPasswordValid=await user.isPasswordCorrect(password)
        if(!isPasswordValid)throw new ApiError(500,"Invalid Credentials!")

        const accessToken=await generateAccesstoken(user._id)
        const loggedInUser=await User.findById(user._id).select("-password ")
        if(!loggedInUser)throw new ApiError(409,"Error Logging user")
        // console.log(accessToken);
        return res
        .status(200)
        .cookie("accessToken",accessToken,{
            httpOnly:true,secure:true,
            sameSite:"none",maxAge:7 * 24 * 60 * 60 * 1000})
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

const changeCurrentPassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
  
      const user = await User.findById(req.user._id);
      if (!user) throw new ApiError(404, "User Not Found!");
  
      const isPasswordValid = await user.isPasswordCorrect(oldPassword);
      if (!isPasswordValid) throw new ApiError(401, "Old Password is Wrong");
  
      user.password = newPassword; 
      await user.save({ validateBeforeSave: false });
  
      return res.status(200).json(new ApiResponse(200, {}, "Password Changed Successfully!"));
    } catch (error) {
      console.error("Error on Password Changing:", error);
      return res.status(error.statuscode || 500).json({
        statuscode: error.statuscode || 500,
        message: error.message || "Error on Password Changing",
        data: null,
        success: false,
        errors: error.errors || [],
      });
    }
};

const ChangedAccountDeatils=async(req,res)=>{
    try {
        const{name,email,phone}=req.body
        if(!name || !email || !phone)throw new ApiError(401,"Fields required")
        const user=await User.findByIdAndUpdate(
            req.user?._id,{
                $set:{
                    name,email,phone
                }
            },{new:true}
        ).select("-password")
        return res
        .status(200)
        .json(new ApiResponse(200,user,"Account details updated successfully"))
    } catch (error) {
        console.error("Error on Changing Account Details:", error);
        return res.status(error.statuscode || 500).json({
          statuscode: error.statuscode || 500,
          message: error.message || "Error on Changing Account Details",
          data: null,
          success: false,
          errors: error.errors || [],
        });
      }
}

const requestPasswordReset= async(req,res)=>{
    try {
        const {email}=req.body
        const user=await User.findOne({email})

        if(!user)throw new ApiError(404,"User Not Found");

        const resetToken=crypto.randomBytes(32).toString("hex")
        console.log("Generated reset token:", resetToken); // Debug log

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordToken=hashedToken
        user.resetPasswordExpires=Date.now() + 3600000;
        await user.save();
        
        // Create the reset link with the token
        const resetLink = `https://mern-pet-adoption-platform.vercel.app/reset-password?token=${resetToken}`;
        console.log("Reset link:", resetLink); // Debug log
        
        // Create a more detailed email template
        const emailSubject = 'Password Reset Request';
        const emailText = `You requested a password reset. Click the link below to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p>You requested a password reset. Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser: ${resetLink}</p>
            </div>
        `;

        await sendEmail(email, emailSubject, emailText, emailHtml);
        
        res.status(200)
        .json(new ApiResponse(200, "Password Reset Email Sent Successfully"))
    }catch (error) {
        console.error("Error on Password Reset request", error);
        return res.status(error.statuscode || 500).json({
          statuscode: error.statuscode || 500,
          message: error.message || "Internal Server error",
          data: null,
          success: false,
          errors: error.errors || [],
        });
      }
}
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });

        if (!user) throw new ApiError(404,"Invalid or expired token")

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200)
        .json(new ApiResponse(200,"Password Reset Successfully!!"))
    } catch (error) {
        console.error("Error Password Reset:", error);
        return res.status(error.statuscode || 500).json({
          statuscode: error.statuscode || 500,
          message: error.message || "Internal Server Error",
          data: null,
          success: false,
          errors: error.errors || [],
        });
      }
};

const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        console.log("Received token:", token); // Debug log

        if (!token) {
            console.log("No token provided"); // Debug log
            return res.redirect(`https://mern-pet-adoption-platform.vercel.app/reset-password?error=invalid_token`);
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        console.log("Hashed token:", hashedToken); // Debug log

        const user = await User.findOne({ 
            resetPasswordToken: hashedToken, 
            resetPasswordExpires: { $gt: Date.now() } 
        });

        console.log("Found user:", user ? "Yes" : "No"); // Debug log

        if (!user) {
            console.log("Invalid or expired token"); // Debug log
            return res.redirect(`https://mern-pet-adoption-platform.vercel.app/reset-password?error=invalid_token`);
        }

        // Redirect to frontend reset password page with the token
        console.log("Redirecting with token:", token); // Debug log
        return res.redirect(`https://mern-pet-adoption-platform.vercel.app/reset-password?token=${token}`);
    } catch (error) {
        console.error("Error verifying reset token:", error);
        return res.redirect(`https://mern-pet-adoption-platform.vercel.app/reset-password?error=server_error`);
    }
};

export {registerUser,loginUser,refreshAccessToken,logoutUser,changeCurrentPassword,ChangedAccountDeatils,requestPasswordReset,resetPassword,verifyResetToken}