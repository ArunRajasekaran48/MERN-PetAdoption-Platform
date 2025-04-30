import mongoose ,{Schema} from "mongoose";
const AdoptionRequestSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    petId: {
        type: Schema.Types.ObjectId,
        ref: 'Pet',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        required: true,
        default: 'pending',
        trim: true,
    },
    requestedAt: {
        type: Date,
        default: Date.now,
    },
    approvedAt: {
        type: Date,
    },
});
const AdoptionRequest =mongoose.model("AdoptionRequest",AdoptionRequestSchema)
export { AdoptionRequest}