import mongoose, { Schema } from "mongoose";
const petSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: String,
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
    description: {
        type: String,
    },
    images: [
        { type: String }
    ],
    isAdopted: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });
export const Pet= mongoose.model("Pets",petSchema);