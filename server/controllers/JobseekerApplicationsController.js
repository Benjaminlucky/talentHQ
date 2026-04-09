// controllers/JobseekerApplicationsController.js
import JobseekerApplication from "../models/JobseekerApplication.js";
import Jobnode from "../models/Jobnode.js";
import Certification from "../models/Certification.js";
import Education from "../models/Education.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import Workexperience from "../models/Workexperience.js";

// ── Jobseeker creates a new application ───────────────────────────────────────
export const createApplication = async (req, res) => {
  try {
    const {
      roleTitle,
      roleType,
      preferredLocation,
      coverLetter,
      portfolioLinks,
    } = req.body;
    const newApplication = await JobseekerApplication.create({
      jobseeker: req.user.id,
      roleTitle,
      roleType,
      preferredLocation,
      coverLetter,
      portfolioLinks,
      resume: req.body.resume || "",
    });
    res.status(201).json(newApplication);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Jobseeker views their own applications ────────────────────────────────────
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

// ── Employers / admin view all applications ───────────────────────────────────
export const getAllApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== "all") query.status = status;

    let apps = await JobseekerApplication.find(query)
      .populate("jobseeker", "fullName avatar email location headline tagline")
      .sort({ createdAt: -1 })
      .lean();

    // Client-side search filter (keeps it simple, avoids text index dependency)
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

// ── Get single application with full candidate profile ────────────────────────
export const getApplicationById = async (req, res) => {
  try {
    const app = await JobseekerApplication.findById(req.params.id).populate({
      path: "jobseeker",
      select: "fullName avatar email location headline tagline linkedin github",
    });

    if (!app) return res.status(404).json({ error: "Application not found" });

    const obj = app.toObject();
    const jobseekerId = obj.jobseeker?._id;

    let education = [],
      projects = [],
      certifications = [],
      workExperience = [],
      skills = [];

    if (jobseekerId) {
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
      employerMessage: obj.employerMessage || "",
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      resumeAvailable: !!obj.resume,
      jobseeker: {
        _id: jobseekerId || null,
        fullName: obj.jobseeker?.fullName || "Anonymous",
        avatar: obj.jobseeker?.avatar || "",
        email: obj.jobseeker?.email || "",
        headline: obj.jobseeker?.headline || "",
        tagline: obj.jobseeker?.tagline || "",
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
// Route: PUT /api/profile/applications/:id/status
// Protected: employer or superadmin only
export const updateApplicationStatus = async (req, res) => {
  try {
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

    res.json({
      message: `Application marked as ${status}`,
      application: app,
    });
  } catch (err) {
    console.error("❌ updateApplicationStatus:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── Jobseeker deletes their own application ───────────────────────────────────
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

// ── Resume download endpoint ───────────────────────────────────────────────────
export const getResume = async (req, res) => {
  try {
    const app = await JobseekerApplication.findById(req.params.id).populate(
      "jobseeker",
    );
    if (!app) return res.status(404).json({ error: "Application not found" });
    if (!app.resume)
      return res.status(400).json({ error: "No resume uploaded" });
    res.json({ resume: app.resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
