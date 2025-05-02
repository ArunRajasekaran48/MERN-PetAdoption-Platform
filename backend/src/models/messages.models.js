import mongoose ,{Schema} from "mongoose";

const MessageSchema = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    encryptedContent: {
        type: String,
        required: true,
    },
    iv: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

export const Messages=mongoose.model('Messages',MessageSchema)