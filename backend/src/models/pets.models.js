import mongoose, { Schema } from "mongoose";
import AggregatePaginate from "mongoose-aggregate-paginate-v2"
const PetSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    species: {
        type: String,
        enum: ['dog', 'cat', 'rabbit', 'bird', 'other'],
        required: true,
        trim: true,
    },
    breed: {
        type: String,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true,
        trim: true,
    },
    size: {
        type: String,
        enum: ['small', 'medium', 'large'],
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['available', 'adopted', 'pending'],
        required: true,
        trim: true,
    },
    images: {
        type: [String],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
PetSchema.plugin(AggregatePaginate)
const Pet= mongoose.model("Pets",PetSchema);