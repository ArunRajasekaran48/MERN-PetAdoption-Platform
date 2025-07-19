import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
const userSchema = new Schema({
  name: {
      type: String,
      required: true,
      trim: true,
  },
  email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase:true
  },
  password: {
      type: String,
      required: true,
      trim: true,
  },
  phone: {
      type: String,
      trim: true,
  },
  role: {
      type: String,
      enum: ['User', 'Admin'],
      required: true,
      trim: true,
  },
  isBanned: {
      type: Boolean,
      default: false,
  },
  banReason: {
      type: String,
      default: null,
  },
  suspendedUntil: {
      type: Date,
      default: null,
  },
  resetPasswordToken: { 
    type: String 
  },
  resetPasswordExpires: { 
    type: Date 
  },
  createdAt: {
      type: Date,
      default: Date.now,
  },
},
{ timestamps: true }
);

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccesstoken = function () {
    return jwt.sign(
        { _id: this.id },                
        process.env.JWT_SECRET,          
        { expiresIn: process.env.EXPIRES_IN } 
    );
};

userSchema.methods.generatePasswordResetToken= function (){
    const resetToken=crypto.randomBytes(20).toString("hex")
    this.resetPasswordToken=crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1500; // 15 minutes
    return resetToken
}
export const User=mongoose.model("User",userSchema)