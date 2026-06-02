// controllers/JobseekerApplicationsController.js
import JobseekerApplication from "../models/JobseekerApplication.js";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import Certification from "../models/Certification.js";
import Education from "../models/Education.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import Workexperience from "../models/Workexperience.js";
import {
  createNotification,
  roleToModel,
} from "../utils/notificationHelper.js";
import { sendApplicationStatusEmail } from "../utils/email.js";

// Fields selected when populating the polymorphic applicant. Includes Jobnode
// fields (headline/tagline/linkedin/github) AND Handyman fields (trade/bio) so
// the employer UI renders correctly for either applicant type.
// NOTE: "email" is intentionally EXCLUDED from public-facing selects (privacy).
const APPLICANT_SELECT_PUBLIC =
  "fullName avatar location headline tagline linkedin github trade bio";
const APPLICANT_SELECT_PRIVATE =
  "fullName avatar email location headline tagline linkedin github trade bio";

// ── Applicant (jobseeker OR handyman) creates a new application ───────────────
export const createApplication = async (req, res) => {
  try {
    const {
      roleTitle,
      roleType,
      preferredLocation,
      coverLetter,
      portfolioLinks,
    } = req.body;

    // Determine applicant type from the authenticated user's role
    const role = req.user.role === "handyman" ? "handyman" : "jobseeker";
    const applicantModel = role === "handyman" ? "Handyman" : "Jobnode";

    const newApplication = await JobseekerApplication.create({
      jobseeker: req.user.id,
      applicantModel,
      applicantRole: role,
      roleTitle,
      roleType,
      preferredLocation,
      coverLetter,
      portfolioLinks,
      resume: req.body.resume || "",
    });

    // Notify the applicant: submission confirmation (correct model + dashboard)
    const dashLink =
      role === "handyman"
        ? "/dashboard/handyman/applications"
        : "/dashboard/jobseeker/applications";

    createNotification({
      recipientId: req.user.id,
      recipientModel: applicantModel,
      type: "application_received",
      title: "Application submitted ✓",
      message: `Your application for "${roleTitle}" has been submitted. We'll notify you when there's an update.`,
      link: dashLink,
    });

    res.status(201).json(newApplication);
  } catch (err) {
    console.error("❌ createApplication:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── Applicant views their own applications ────────────────────────────────────
export const getMyApplications = async (req, res) => {
  try {
    const apps = await JobseekerApplication.find({ jobseeker: req.user.id })
      .populate("jobseeker", "fullName avatar email")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Public: list applications (homepage / candidate browsing) ─────────────────
// PUBLIC endpoint — must NOT expose email or other PII.
export const getAllApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== "all") query.status = status;

    let apps = await JobseekerApplication.find(query)
      .populate("jobseeker", APPLICANT_SELECT_PUBLIC)
      .sort({ createdAt: -1 })
      .lean();

    if (search) {
      const s = search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.roleTitle?.toLowerCase().includes(s) ||
          a.jobseeker?.fullName?.toLowerCase().includes(s) ||
          a.jobseeker?.headline?.toLowerCase().includes(s),
      );
    }

    const total = apps.length;
    const paginated = apps.slice(
      (Number(page) - 1) * Number(limit),
      Number(page) * Number(limit),
    );

    const safeApplications = paginated.map((app) => ({
      ...app,
      resume: undefined,
      resumeAvailable: !!app.resume,
    }));

    res.json({
      applications: safeApplications,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Public: single application with candidate profile ─────────────────────────
// PUBLIC endpoint — must NOT expose email. (Employers contact via the in-app
// messaging system, not by scraping email addresses from a public page.)
export const getApplicationById = async (req, res) => {
  try {
    const app = await JobseekerApplication.findById(req.params.id).populate({
      path: "jobseeker",
      select: APPLICANT_SELECT_PUBLIC,
    });

    if (!app) return res.status(404).json({ error: "Application not found" });

    const obj = app.toObject();
    const jobseekerId = obj.jobseeker?._id;
    const isHandyman = obj.applicantModel === "Handyman";

    // Profile sub-collections (education, projects, etc.) only exist for
    // jobseekers (Jobnode). Handymen store their details on the Handyman doc,
    // so we skip these lookups for them.
    let education = [],
      projects = [],
      certifications = [],
      workExperience = [],
      skills = [];

    if (jobseekerId && !isHandyman) {
      [education, projects, certifications, workExperience, skills] =
        await Promise.all([
          Education.find({ user: jobseekerId }),
          Project.find({ user: jobseekerId }),
          Certification.find({ user: jobseekerId }),
          Workexperience.find({ user: jobseekerId }),
          Skill.find({ user: jobseekerId }),
        ]);
    }

    let location = obj.jobseeker?.location || {};
    if (typeof location === "string")
      location = { country: location, city: "", area: "" };

    const safeApp = {
      _id: obj._id,
      roleTitle: obj.roleTitle,
      roleType: obj.roleType,
      preferredLocation: obj.preferredLocation,
      coverLetter: obj.coverLetter,
      portfolioLinks: obj.portfolioLinks,
      status: obj.status,
      applicantRole:
        obj.applicantRole || (isHandyman ? "handyman" : "jobseeker"),
      employerMessage: obj.employerMessage || "",
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      resumeAvailable: !!obj.resume,
      jobseeker: {
        _id: jobseekerId || null,
        fullName: obj.jobseeker?.fullName || "Anonymous",
        avatar: obj.jobseeker?.avatar || "",
        // email intentionally omitted from public payload
        // For handymen, surface trade as headline and bio as tagline
        headline: obj.jobseeker?.headline || obj.jobseeker?.trade || "",
        tagline: obj.jobseeker?.tagline || obj.jobseeker?.bio || "",
        linkedin: obj.jobseeker?.linkedin || "",
        github: obj.jobseeker?.github || "",
        location,
        education,
        projects,
        certifications,
        workExperience,
        skill: skills,
      },
    };

    res.json(safeApp);
  } catch (err) {
    console.error("❌ getApplicationById:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── Employer updates application status + optional message ────────────────────
// EMPLOYER (or superadmin) ONLY.
export const updateApplicationStatus = async (req, res) => {
  try {
    // ── Authorization: only employers / superadmins may change status ─────────
    if (req.user.role !== "employer" && req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ error: "Only employers can update application status" });
    }

    const { status, employerMessage } = req.body;

    const allowed = ["pending", "reviewed", "accepted", "rejected"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${allowed.join(", ")}` });
    }

    const updates = { status };
    if (employerMessage !== undefined)
      updates.employerMessage = employerMessage.trim();

    const app = await JobseekerApplication.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true },
    ).populate("jobseeker", "fullName email avatar");

    if (!app) return res.status(404).json({ error: "Application not found" });

    // Resolve applicant type so we notify the correct collection + dashboard
    const applicantRole =
      app.applicantRole ||
      (app.applicantModel === "Handyman" ? "handyman" : "jobseeker");
    const recipientModel = roleToModel(applicantRole);
    const dashLink =
      applicantRole === "handyman"
        ? "/dashboard/handyman/applications"
        : "/dashboard/jobseeker/applications";

    // ── In-app notification ───────────────────────────────────────────────────
    const statusMessages = {
      accepted: {
        title: "🎉 Application accepted!",
        message: `Congratulations! Your application for "${app.roleTitle}" has been accepted.${employerMessage ? ` Message: "${employerMessage}"` : ""}`,
      },
      rejected: {
        title: "Application update",
        message: `Your application for "${app.roleTitle}" was not selected this time.${employerMessage ? ` Note: "${employerMessage}"` : " Keep applying!"}`,
      },
      reviewed: {
        title: "Application under review",
        message: `Your application for "${app.roleTitle}" is being reviewed by the employer.`,
      },
      pending: {
        title: "Application status updated",
        message: `Your application for "${app.roleTitle}" has been updated.`,
      },
    };

    const notifContent = statusMessages[status];
    if (notifContent && app.jobseeker?._id) {
      createNotification({
        recipientId: app.jobseeker._id,
        recipientModel,
        type: "application_status",
        title: notifContent.title,
        message: notifContent.message,
        link: dashLink,
      });
    }

    // ── Email notification (fire-and-forget) ─────────────────────────────────
    if (app.jobseeker?.email) {
      sendApplicationStatusEmail(app.jobseeker.email, {
        applicantName: app.jobseeker.fullName || "there",
        roleTitle: app.roleTitle,
        status,
        employerMessage: employerMessage?.trim() || "",
      }).catch((err) =>
        console.error(
          "⚠️  Application status email failed (non-fatal):",
          err.message,
        ),
      );
    }

    res.json({ message: `Application marked as ${status}`, application: app });
  } catch (err) {
    console.error("❌ updateApplicationStatus:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── Applicant deletes their own application ───────────────────────────────────
export const deleteApplication = async (req, res) => {
  try {
    const app = await JobseekerApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (app.jobseeker.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await app.deleteOne();
    res.json({ message: "Application deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Resume download (authenticated) ───────────────────────────────────────────
export const getResume = async (req, res) => {
  try {
    const app = await JobseekerApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (!app.resume)
      return res.status(400).json({ error: "No resume uploaded" });
    res.json({ resume: app.resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
