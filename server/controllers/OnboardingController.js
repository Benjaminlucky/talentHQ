import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import Skill from "../models/Skill.js";

const sanitize = (doc) => {
  if (!doc) return null;
  const { password, __v, ...rest } = doc.toObject ? doc.toObject() : doc;
  return rest;
};

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.RENDER_EXTERNAL_URL || "https://talenthq-1.onrender.com"
    : "http://localhost:5000";

// When using upload.fields(), uploaded files land in req.files as an object keyed by field name.
// Each value is an array; we take index [0] for the first (and only) file.
const getUploadedFileUrl = (req, fieldName) => {
  const files = req.files?.[fieldName];
  if (!files || files.length === 0) return null;
  const file = files[0];
  // Cloudinary upload gives file.path as the secure_url
  if (file.path) return file.path;
  // Local disk storage gives file.filename
  if (file.filename) return `${BASE_URL}/uploads/resumes/${file.filename}`;
  return null;
};

// ─── JOBSEEKER ────────────────────────────────────────────────────────────────
export const updateJobSeekerOnboarding = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = { ...req.body };

    // Resume from upload.fields()
    const resumeUrl = getUploadedFileUrl(req, "resume");
    if (resumeUrl) updates.resume = resumeUrl;

    // Avatar from upload.fields()
    const avatarUrl = getUploadedFileUrl(req, "avatar");
    if (avatarUrl) updates.avatar = avatarUrl;

    // Reject any base64 that slipped through (prevents DB bloat)
    if (updates.avatar?.startsWith("data:")) delete updates.avatar;

    // Skills: convert comma-separated string → array of Skill documents
    if (updates.skills) {
      const raw =
        typeof updates.skills === "string"
          ? updates.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : Array.isArray(updates.skills)
            ? updates.skills.filter(Boolean)
            : [];

      const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      updates.skill = await Promise.all(
        raw.map(async (s) => {
          if (isObjectId(s)) return s;
          const skillDoc = await Skill.create({
            user: userId,
            name: s,
            level: "Beginner",
          });
          return skillDoc._id;
        }),
      );
      delete updates.skills;
    }

    // Normalize location: state + city → structured object
    if (updates.state || updates.city) {
      updates.location = {
        country: "Nigeria",
        city: updates.city || "",
        area: updates.state || "",
      };
      delete updates.state;
      delete updates.city;
    } else if (typeof updates.location === "string" && updates.location) {
      const parts = updates.location.split(",").map((p) => p.trim());
      updates.location = {
        city: parts[0] || "",
        country: parts[1] || "Nigeria",
        area: "",
      };
    }

    updates.onboardingComplete = true;

    const updated = await Jobnode.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ message: "Jobseeker not found" });

    return res
      .status(200)
      .json({ message: "Onboarding updated", user: sanitize(updated) });
  } catch (err) {
    console.error("❌ jobseeker onboarding:", err);
    res.status(500).json({ message: "Onboarding failed", error: err.message });
  }
};

// ─── HANDYMAN ─────────────────────────────────────────────────────────────────
export const updateHandymanOnboarding = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = { ...req.body };

    if (updates.yearsExperience !== undefined) {
      const n = Number(updates.yearsExperience);
      updates.yearsExperience = Number.isNaN(n) ? 0 : n;
    }

    if (updates.state || updates.city) {
      updates.location = `${updates.city || ""}, ${updates.state || ""}`
        .trim()
        .replace(/^,\s*/, "");
      delete updates.state;
      delete updates.city;
    }

    updates.onboardingComplete = true;

    const updated = await Handyman.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ message: "Handyman not found" });

    return res
      .status(200)
      .json({ message: "Onboarding updated", user: sanitize(updated) });
  } catch (err) {
    console.error("❌ handyman onboarding:", err);
    res.status(500).json({ message: "Onboarding failed", error: err.message });
  }
};

// ─── EMPLOYER ─────────────────────────────────────────────────────────────────
export const updateEmployerOnboarding = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = { ...req.body };

    // Logo from upload.fields()
    const logoUrl = getUploadedFileUrl(req, "logo");
    if (logoUrl) updates.logo = logoUrl;

    if (updates.state || updates.city) {
      updates.location = `${updates.city || ""}, ${updates.state || ""}`
        .trim()
        .replace(/^,\s*/, "");
      delete updates.state;
      delete updates.city;
    }

    updates.onboardingComplete = true;

    const updated = await Employer.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ message: "Employer not found" });

    return res
      .status(200)
      .json({ message: "Onboarding updated", user: sanitize(updated) });
  } catch (err) {
    console.error("❌ employer onboarding:", err);
    res.status(500).json({ message: "Onboarding failed", error: err.message });
  }
};
