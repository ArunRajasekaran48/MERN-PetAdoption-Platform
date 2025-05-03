import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { deleteConversation, deleteMessage, getConversation, getUnreadMessageCount, listConversations, markMessagesAsRead, sendMessage } from "../controllers/messages.controller.js";
const router=Router()

router.post("/send-message",verifyJWT,sendMessage);
router.get("/get-conversation/:otherUserId",verifyJWT,getConversation)
router.get("/listConversations",verifyJWT,listConversations)
router.put("/mark-messages-as-read/:senderId",verifyJWT,markMessagesAsRead)
router.delete('/message/:messageId',verifyJWT, deleteMessage);
router.delete('/conversation/:otherUserId', verifyJWT, deleteConversation);
router.get("/unread-count",verifyJWT,getUnreadMessageCount)

export default router