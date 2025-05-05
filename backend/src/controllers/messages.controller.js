import { Messages } from '../models/messages.models.js';
import { encryptMessage, decryptMessage } from '../utils/encryption.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        if (!receiverId || !content) {
            throw new ApiError(400, "Receiver and content are required");
        }

        const { encryptedData, iv } = encryptMessage(content);

        const message = await Messages.create({
            senderId,
            receiverId,
            encryptedContent: encryptedData,
            iv
        });

        return res.status(201).json(new ApiResponse(201, "Message sent", message));
    } catch (error) {
        console.error("Send Message Error:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
            data: null,
        });
    }
};

 const getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId } = req.params;

        const messages = await Messages.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });

        const decryptedMessages = messages.map(msg => ({
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: decryptMessage(msg.encryptedContent, msg.iv),
            timestamp: msg.timestamp
        }));

        return res.status(200).json(new ApiResponse(200, "Conversation fetched", decryptedMessages));
    } catch (error) {
        console.error("Fetch Conversation Error:", error);
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
            data: null,
        });
    }
};

const listConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const messages = await Messages.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ timestamp: -1 });

        const conversations = new Map();

        messages.forEach(msg => {
            const otherId = msg.senderId.equals(userId) ? msg.receiverId.toString() : msg.senderId.toString();
            if (!conversations.has(otherId)) {
                conversations.set(otherId, {
                    _id: msg._id,
                    senderId: msg.senderId,
                    receiverId: msg.receiverId,
                    content: decryptMessage(msg.encryptedContent, msg.iv),
                    timestamp: msg.timestamp
                });
            }
        });

        return res.status(200).json(new ApiResponse(200, "Recent conversations fetched", [...conversations.values()]));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
            data: null,
        });
    }
};

const markMessagesAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        const receiverId = req.user._id;
        await Messages.updateMany(
            { senderId, receiverId, read: false },
            { $set: { read: true } }
        );

        return res.status(200).json(new ApiResponse(200, "Messages marked as read", null));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
            data: null,
        });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        await Messages.findByIdAndUpdate(messageId, {
            $addToSet: { deletedBy: userId }
        });

        return res.status(200).json(new ApiResponse(200, "Message deleted for user", null));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
            data: null,
        });
    }
};

const deleteConversation = async (req, res) => {
    try {
        const { withUserId } = req.params;
        const userId = req.user._id;

        await Messages.updateMany(
            {
                $or: [
                    { senderId: userId, receiverId: withUserId },
                    { senderId: withUserId, receiverId: userId }
                ]
            },
            { $addToSet: { deletedBy: userId } }
        );

        return res.status(200).json(new ApiResponse(200, "Conversation deleted for user", null));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
            data: null,
        });
    }
};

const getUnreadMessageCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const count = await Messages.countDocuments({
            receiverId: userId,
            read: false,
            deletedBy: { $ne: userId }
        });

        return res.status(200).json(new ApiResponse(200, "Unread message count fetched", { count }));
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
            data: null,
        });
    }
};
export{sendMessage,getConversation,listConversations,markMessagesAsRead,deleteMessage,deleteConversation,getUnreadMessageCount}