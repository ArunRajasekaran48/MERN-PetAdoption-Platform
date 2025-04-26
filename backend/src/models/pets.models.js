import mongoose, { Schema } from "mongoose";
const petSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    breed: {
        type: String,
        required: true,
    },
    species: {
        type: String,
        enum: ['dog', 'cat', 'bird', 'other'],
        required: true,
    },
    gender:{
        type:String,
        required:true
    },
    description: {
        type: String,
    },
    images: [
        { type: String }
    ],
    adoptionStatus: {
        type: String,
        enum: ['available', 'pending', 'adopted'],
        default: 'available'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });
export const Pet= mongoose.model("Pets",petSchema);