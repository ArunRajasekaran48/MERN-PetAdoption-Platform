import mongoose, { Schema } from "mongoose";
import AggregatePaginate from "mongoose-aggregate-paginate-v2"
const petSchema = new mongoose.Schema({
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
    description: {
        type: String,
    },
    image: {
        type: String, // Store image URLs (e.g., from Multer upload)
    },
    isAdopted: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });
petSchema.plugin(AggregatePaginate)
const Pet= mongoose.model("Pets",petSchema);
export {Pet}