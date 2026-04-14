// controllers/contactController.js
import ContactMessage from "../models/ContactMessage.js";

// ── Fire-and-forget Resend notifications ─────────────────────────────────────
// Never awaited in the request handler — email failure must never block the response.
async function notifyAdmin(contact) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@talenthq.buzz";
  const EMAIL_FROM =
    process.env.EMAIL_FROM || "TalentHQ <noreply@talenthq.buzz>";

  if (!RESEND_API_KEY) {
    console.warn("⚠️  RESEND_API_KEY not set — contact form email not sent");
    return;
  }

  const adminHtml = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#374151">
      <div style="background:#004b23;padding:20px 28px;border-radius:12px 12px 0 0">
        <h2 style="color:#fff;margin:0;font-size:18px;font-weight:900">
          Talent<span style="color:#7fba00">HQ</span> — New Contact Message
        </h2>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b7280;width:110px">Name</td>     <td style="padding:6px 0;font-weight:700">${contact.name}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Email</td>    <td style="padding:6px 0"><a href="mailto:${contact.email}" style="color:#004b23">${contact.email}</a></td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Phone</td>    <td style="padding:6px 0">${contact.phone || "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Category</td> <td style="padding:6px 0">${contact.category}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Subject</td>  <td style="padding:6px 0;font-weight:600">${contact.subject}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:16px 0" />
        <p style="font-size:13px;color:#6b7280;margin:0 0 8px">Message:</p>
        <p style="background:#f9fafb;padding:14px;border-radius:8px;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap">${contact.message}</p>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:16px 0" />
        <p style="font-size:12px;color:#9ca3af;margin:0">
          Ref: ${contact._id} · ${new Date(contact.createdAt).toLocaleString("en-NG")}
        </p>
        <p style="font-size:12px;color:#9ca3af;margin-top:4px">
          <a href="${process.env.FRONTEND_URL || "https://talenthq.buzz"}/dashboard-admin" style="color:#004b23">Open admin dashboard →</a>
        </p>
      </div>
    </div>
  `;

  const replyHtml = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#374151">
      <div style="background:#004b23;padding:20px 28px;border-radius:12px 12px 0 0">
        <h2 style="color:#fff;margin:0;font-size:18px;font-weight:900">Talent<span style="color:#7fba00">HQ</span></h2>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 12px 12px">
        <h3 style="font-size:16px;font-weight:800;color:#111827;margin:0 0 12px">We got your message, ${contact.name}!</h3>
        <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 12px">
          Thanks for reaching out. Our team will review your message and respond within <strong>24 hours</strong>.
        </p>
        <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0">
          Your reference number: <strong style="color:#004b23">${contact._id}</strong>
        </p>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0" />
        <p style="font-size:13px;color:#9ca3af;margin:0">
          Urgent? Email us at <a href="mailto:hello@talenthq.buzz" style="color:#004b23">hello@talenthq.buzz</a>
        </p>
      </div>
      <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:16px">
        © ${new Date().getFullYear()} TalentHQ Nigeria
      </p>
    </div>
  `;

  const send = (payload) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

  try {
    const [adminRes, replyRes] = await Promise.all([
      send({
        from: EMAIL_FROM,
        to: [ADMIN_EMAIL],
        subject: `[TalentHQ Contact] ${contact.subject}`,
        html: adminHtml,
      }),
      send({
        from: EMAIL_FROM,
        to: [contact.email],
        subject: "We received your message — TalentHQ",
        html: replyHtml,
      }),
    ]);

    const adminData = await adminRes.json();
    const replyData = await replyRes.json();

    if (!adminRes.ok) console.error("⚠️  Admin email failed:", adminData);
    if (!replyRes.ok) console.error("⚠️  Auto-reply failed:", replyData);
    if (adminRes.ok && replyRes.ok) {
      console.log(`📧 Contact emails sent → ${ADMIN_EMAIL} + ${contact.email}`);
    }
  } catch (err) {
    // Non-fatal — message is already saved in DB
    console.error("⚠️  Contact email error (non-fatal):", err.message);
  }
}

// ── POST /api/contact ─────────────────────────────────────────────────────────
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, category, message } = req.body;

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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

    // Fire emails without awaiting — HTTP response is instant
    notifyAdmin(contact);

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

// ── GET /api/superadmin/contact-messages ─────────────────────────────────────
export const getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const [total, messages] = await Promise.all([
      ContactMessage.countDocuments(query),
      ContactMessage.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
    ]);

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

// ── PATCH /api/superadmin/contact-messages/:id ────────────────────────────────
export const updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["unread", "read", "resolved", "spam"].includes(status)) {
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
