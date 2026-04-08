// controllers/contactController.js
import ContactMessage from "../models/ContactMessage.js";

// POST /api/contact
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, category, message } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim() ||
      !category
    ) {
      return res.status(400).json({
        message: "name, email, subject, category, and message are required",
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (message.trim().length < 20) {
      return res
        .status(400)
        .json({ message: "Message must be at least 20 characters" });
    }

    const contact = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      subject: subject.trim(),
      category,
      message: message.trim(),
      ip: req.ip || req.connection?.remoteAddress || "",
    });

    return res.status(201).json({
      message: "Message received. We'll get back to you within 24 hours.",
      id: contact._id,
    });
  } catch (err) {
    console.error("❌ Contact form error:", err);
    return res
      .status(500)
      .json({ message: "Failed to submit message. Please try again." });
  }
};

// GET /api/superadmin/contact-messages — admin only
export const getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const total = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    return res.json({
      messages,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("❌ Get contact messages error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/superadmin/contact-messages/:id — mark as read/resolved
export const updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["unread", "read", "resolved", "spam"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!msg) return res.status(404).json({ message: "Message not found" });

    return res.json({ message: "Status updated", contact: msg });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
