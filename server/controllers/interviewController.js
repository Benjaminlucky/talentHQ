// controllers/interviewController.js
import Interview from "../models/Interview.js";
import JobseekerApplication from "../models/JobseekerApplication.js";

// ── POST /api/interviews ───────────────────────────────────────────────────────
// Employer schedules an interview for an application
export const scheduleInterview = async (req, res) => {
  try {
    if (req.user.role !== "employer" && req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Only employers can schedule interviews" });
    }

    const {
      applicationId,
      date,
      time,
      format,
      location,
      platform,
      title,
      notes,
      timezone,
    } = req.body;

    if (!applicationId || !date || !time || !format || !title) {
      return res.status(400).json({
        message: "applicationId, date, time, format and title are required",
      });
    }

    // Verify the application exists and belongs to this employer's context
    const application = await JobseekerApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Prevent scheduling if application is rejected
    if (application.status === "rejected") {
      return res.status(400).json({
        message: "Cannot schedule an interview for a rejected application",
      });
    }

    const interview = await Interview.create({
      applicationId,
      employerId: req.user.id,
      jobseekerId: application.jobseeker,
      date: new Date(date),
      time,
      timezone: timezone || "Africa/Lagos",
      format,
      location: location || "",
      platform: platform || "",
      title,
      notes: notes || "",
    });

    // Auto-advance application to "reviewed" if still pending
    if (application.status === "pending") {
      await JobseekerApplication.findByIdAndUpdate(applicationId, {
        status: "reviewed",
      });
    }

    res.status(201).json({ message: "Interview scheduled", interview });
  } catch (err) {
    console.error("❌ scheduleInterview:", err);
    res.status(500).json({ message: "Failed to schedule interview" });
  }
};

// ── GET /api/interviews/employer ───────────────────────────────────────────────
// Employer views all their scheduled interviews
export const getEmployerInterviews = async (req, res) => {
  try {
    if (req.user.role !== "employer" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = { employerId: req.user.id };
    if (status) query.status = status;

    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .populate("applicationId", "roleTitle roleType status")
        .populate("jobseekerId", "fullName email avatar headline")
        .sort({ date: 1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Interview.countDocuments(query),
    ]);

    res.json({ interviews, total, page: Number(page) });
  } catch (err) {
    console.error("❌ getEmployerInterviews:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};

// ── GET /api/interviews/jobseeker ──────────────────────────────────────────────
// Jobseeker views their interview invitations
export const getJobseekerInterviews = async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Access denied" });
    }

    const interviews = await Interview.find({ jobseekerId: req.user.id })
      .populate("applicationId", "roleTitle roleType")
      .populate("employerId", "fullName companyName email logo")
      .sort({ date: 1 })
      .lean();

    res.json({ interviews });
  } catch (err) {
    console.error("❌ getJobseekerInterviews:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};

// ── GET /api/interviews/application/:applicationId ─────────────────────────────
// Get interviews for a specific application
export const getInterviewsByApplication = async (req, res) => {
  try {
    const interviews = await Interview.find({
      applicationId: req.params.applicationId,
    })
      .populate("employerId", "companyName logo")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ interviews });
  } catch (err) {
    console.error("❌ getInterviewsByApplication:", err);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};

// ── PUT /api/interviews/:id ────────────────────────────────────────────────────
// Employer updates interview details
export const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    if (
      interview.employerId.toString() !== req.user.id.toString() &&
      req.user.role !== "superadmin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorised to edit this interview" });
    }

    const allowed = [
      "date",
      "time",
      "format",
      "location",
      "platform",
      "title",
      "notes",
      "status",
      "timezone",
    ];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) interview[k] = req.body[k];
    });

    if (req.body.status === "rescheduled" || req.body.date || req.body.time) {
      interview.candidateResponse = "pending"; // reset acceptance on any reschedule
    }

    await interview.save();
    res.json({ message: "Interview updated", interview });
  } catch (err) {
    console.error("❌ updateInterview:", err);
    res.status(500).json({ message: "Failed to update interview" });
  }
};

// ── PATCH /api/interviews/:id/respond ─────────────────────────────────────────
// Jobseeker accepts or declines an interview
export const respondToInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    if (interview.jobseekerId.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorised to respond to this interview" });
    }

    const { response, note } = req.body;
    if (!["accepted", "declined"].includes(response)) {
      return res
        .status(400)
        .json({ message: "Response must be 'accepted' or 'declined'" });
    }

    interview.candidateResponse = response;
    interview.candidateNote = note || "";
    if (response === "accepted") interview.status = "confirmed";

    await interview.save();
    res.json({ message: `Interview ${response}`, interview });
  } catch (err) {
    console.error("❌ respondToInterview:", err);
    res.status(500).json({ message: "Failed to respond to interview" });
  }
};

// ── DELETE /api/interviews/:id ─────────────────────────────────────────────────
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview)
      return res.status(404).json({ message: "Interview not found" });

    if (
      interview.employerId.toString() !== req.user.id.toString() &&
      req.user.role !== "superadmin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this interview" });
    }

    await interview.deleteOne();
    res.json({ message: "Interview cancelled" });
  } catch (err) {
    console.error("❌ deleteInterview:", err);
    res.status(500).json({ message: "Failed to cancel interview" });
  }
};
