// controllers/messageController.js
import { Conversation, Message } from "../models/Message.js";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
const MODEL_MAP = {
  jobseeker: { Model: Jobnode, modelName: "Jobnode" },
  handyman: { Model: Handyman, modelName: "Handyman" },
  employer: { Model: Employer, modelName: "Employer" },
};

async function getParticipantInfo(userId, role) {
  const { Model, modelName } = MODEL_MAP[role] || {};
  if (!Model) return null;
  const user = await Model.findById(userId).select("fullName avatar").lean();
  if (!user) return null;
  return {
    userId,
    userModel: modelName,
    fullName: user.fullName || "User",
    avatar: user.avatar || "",
    role,
  };
}

// ── GET /api/messages/conversations ──────────────────────────────────────────
// Returns all conversations for the authenticated user, sorted by latest message
export const getConversations = async (req, res) => {
  try {
    const convos = await Conversation.find({
      "participants.userId": req.user.id,
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Annotate each conversation with the OTHER participant's info
    // and the unread count for the current user
    const annotated = convos.map((c) => {
      const myIndex = c.participants.findIndex(
        (p) => p.userId.toString() === req.user.id.toString(),
      );
      const other = c.participants[myIndex === 0 ? 1 : 0];
      const unread = c.unreadCount?.[myIndex] || 0;
      return {
        _id: c._id,
        other,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unread,
        createdAt: c.createdAt,
      };
    });

    res.json({ conversations: annotated });
  } catch (err) {
    console.error("❌ getConversations:", err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// ── POST /api/messages/conversations ─────────────────────────────────────────
// Start or retrieve a conversation with another user
export const startConversation = async (req, res) => {
  try {
    const { recipientId, recipientRole } = req.body;

    if (!recipientId || !recipientRole) {
      return res
        .status(400)
        .json({ message: "recipientId and recipientRole are required" });
    }

    if (req.user.id.toString() === recipientId.toString()) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    // Check if conversation already exists
    const existing = await Conversation.findOne({
      "participants.userId": { $all: [req.user.id, recipientId] },
    });

    if (existing) {
      return res.json({ conversation: existing, isNew: false });
    }

    // Build participant objects
    const [me, them] = await Promise.all([
      getParticipantInfo(req.user.id, req.user.role),
      getParticipantInfo(recipientId, recipientRole),
    ]);

    if (!me || !them) {
      return res.status(404).json({ message: "One or both users not found" });
    }

    const convo = await Conversation.create({
      participants: [me, them],
      unreadCount: [0, 0],
    });

    res.status(201).json({ conversation: convo, isNew: true });
  } catch (err) {
    console.error("❌ startConversation:", err);
    res.status(500).json({ message: "Failed to start conversation" });
  }
};

// ── GET /api/messages/:conversationId ─────────────────────────────────────────
// Get messages for a conversation (paginated, oldest first)
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is a participant
    const convo = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": req.user.id,
    });

    if (!convo) {
      return res
        .status(403)
        .json({ message: "Conversation not found or access denied" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 }) // oldest first for chat display
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const total = await Message.countDocuments({ conversationId });

    // Mark messages as read for this user
    const myIndex = convo.participants.findIndex(
      (p) => p.userId.toString() === req.user.id.toString(),
    );
    if (myIndex !== -1) {
      const unread = [...(convo.unreadCount || [0, 0])];
      unread[myIndex] = 0;
      await convo.updateOne({ unreadCount: unread });
    }

    await Message.updateMany(
      { conversationId, senderId: { $ne: req.user.id }, read: false },
      { read: true },
    );

    res.json({ messages, total, page: Number(page) });
  } catch (err) {
    console.error("❌ getMessages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// ── POST /api/messages/:conversationId ────────────────────────────────────────
// Send a message in a conversation
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }
    if (text.trim().length > 2000) {
      return res
        .status(400)
        .json({ message: "Message too long (max 2000 chars)" });
    }

    // Verify participant
    const convo = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": req.user.id,
    });

    if (!convo) {
      return res
        .status(403)
        .json({ message: "Conversation not found or access denied" });
    }

    const { modelName } = MODEL_MAP[req.user.role] || {};
    if (!modelName) {
      return res
        .status(400)
        .json({ message: "Invalid user role for messaging" });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user.id,
      senderModel: modelName,
      text: text.trim(),
    });

    // Update conversation preview + increment other participant's unread count
    const myIndex = convo.participants.findIndex(
      (p) => p.userId.toString() === req.user.id.toString(),
    );
    const otherIndex = myIndex === 0 ? 1 : 0;
    const unread = [...(convo.unreadCount || [0, 0])];
    unread[otherIndex] = (unread[otherIndex] || 0) + 1;

    await convo.updateOne({
      lastMessage: text.trim().slice(0, 100),
      lastMessageAt: new Date(),
      unreadCount: unread,
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error("❌ sendMessage:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// ── GET /api/messages/unread-count ───────────────────────────────────────────
// Total unread messages across all conversations (for badge in navbar/sidebar)
export const getUnreadCount = async (req, res) => {
  try {
    const convos = await Conversation.find({
      "participants.userId": req.user.id,
    }).lean();

    let total = 0;
    for (const c of convos) {
      const myIndex = c.participants.findIndex(
        (p) => p.userId.toString() === req.user.id.toString(),
      );
      total += c.unreadCount?.[myIndex] || 0;
    }

    res.json({ unread: total });
  } catch (err) {
    console.error("❌ getUnreadCount:", err);
    res.status(500).json({ message: "Failed to get unread count" });
  }
};

// ── DELETE /api/messages/conversations/:conversationId ────────────────────────
// Delete a conversation and all its messages (for the current user only — soft delete via hiding)
export const deleteConversation = async (req, res) => {
  try {
    const convo = await Conversation.findOne({
      _id: req.params.conversationId,
      "participants.userId": req.user.id,
    });
    if (!convo)
      return res.status(404).json({ message: "Conversation not found" });

    await Message.deleteMany({ conversationId: convo._id });
    await convo.deleteOne();

    res.json({ message: "Conversation deleted" });
  } catch (err) {
    console.error("❌ deleteConversation:", err);
    res.status(500).json({ message: "Failed to delete conversation" });
  }
};
