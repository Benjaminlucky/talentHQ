// routes/messageRoutes.js
import express from "express";
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation,
} from "../controllers/messageController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// All message routes require authentication
router.use(verifyToken);

// Conversation management
router.get("/conversations", getConversations);
router.post("/conversations", startConversation);
router.delete("/conversations/:conversationId", deleteConversation);

// Unread badge count
router.get("/unread-count", getUnreadCount);

// Messages within a conversation
router.get("/:conversationId", getMessages);
router.post("/:conversationId", sendMessage);

export default router;
