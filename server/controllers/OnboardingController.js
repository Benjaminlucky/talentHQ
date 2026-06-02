// server/controllers/OnboardingController.js
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import Skill from "../models/Skill.js";

// ── Sanitize — strip password and internal fields before returning ─────────────
const sanitize = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  delete obj.__v;
  delete obj.refreshToken;
  return obj;
};

// FIX: Removed hardcoded "talenthq-1.onrender.com" / RENDER_EXTERNAL_URL.
// In production all files go to Cloudinary (file.path = secure_url).
// In development files go to local disk (file.filename is used with localhost).
const LOCAL_BASE =
  process.env.NODE_ENV !== "production"
    ? `http://localhost:${process.env.PORT || 5000}`
    : "";

// ── getUploadedFileUrl ────────────────────────────────────────────────────────
// Reads the uploaded file URL from req.files (populated by multer upload.fields()).
// Cloudinary: file.path  = the secure_url  (https://res.cloudinary.com/...)
// Local disk: file.filename = just the basename, so we build a full URL.
// The local folder is inferred from the field name (avatar/logo → avatars, else resumes).
const getUploadedFileUrl = (req, fieldName) => {
  const files = req.files?.[fieldName];
  if (!files || files.length === 0) return null;
  const file = files[0];

  // Cloudinary gives file.path as the full secure_url
  if (file.path) return file.path;

  // Local disk storage — build URL from filename
  if (file.filename) {
    const isImage = ["avatar", "logo"].includes(fieldName);
    const folder = isImage ? "avatars" : "resumes";
    return `${LOCAL_BASE}/uploads/${folder}/${file.filename}`;
  }

  return null;
};

// ── JOBSEEKER ─────────────────────────────────────────────────────────────────
export const updateJobSeekerOnboarding = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = { ...req.body };

    // ── Files ──────────────────────────────────────────────────────────────
    const resumeUrl = getUploadedFileUrl(req, "resume");
    if (resumeUrl) updates.resume = resumeUrl;

    const avatarUrl = getUploadedFileUrl(req, "avatar");
    if (avatarUrl) updates.avatar = avatarUrl;

    // Safety: reject base64 strings that may have slipped through
    if (updates.avatar?.startsWith("data:")) delete updates.avatar;

    // ── Skills → Skill documents (ObjectId refs) ──────────────────────────
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
          // If it's already an ObjectId string, use it directly
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

    // ── Location: state + city → structured object ────────────────────────
    // The form sends state and city as separate fields.
    // Jobnode.location is { country, city, area } — we map:
    //   city  → location.city  (the city/town)
    //   state → location.area  (the state)
    if (updates.state || updates.city) {
      updates.location = {
        country: "Nigeria",
        city: updates.city?.trim() || "",
        area: updates.state?.trim() || "",
      };
      delete updates.state;
      delete updates.city;
    }
    // Drop any raw "location" string the client may have appended
    // (the form appends both state+city AND a "location" string — we want the object)
    if (typeof updates.location === "string") {
      delete updates.location;
    }

    updates.onboardingComplete = true;

    const updated = await Jobnode.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ message: "Jobseeker not found" });

    return res.status(200).json({
      message: "Onboarding updated",
      user: sanitize(updated),
    });
  } catch (err) {
    console.error("❌ jobseeker onboarding:", err);
    res.status(500).json({ message: "Onboarding failed", error: err.message });
  }
};

// ── HANDYMAN ──────────────────────────────────────────────────────────────────
export const updateHandymanOnboarding = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = { ...req.body };

    // ── Avatar (now supported — route has upload middleware) ──────────────
    const avatarUrl = getUploadedFileUrl(req, "avatar");
    if (avatarUrl) updates.avatar = avatarUrl;
    if (updates.avatar?.startsWith("data:")) delete updates.avatar;

    // ── yearsExperience must be a number ──────────────────────────────────
    if (updates.yearsExperience !== undefined) {
      const n = Number(updates.yearsExperience);
      updates.yearsExperience = Number.isNaN(n) ? 0 : n;
    }

    // ── Skills: keep as String[] on Handyman model ────────────────────────
    // Handyman.skills is String[] (not ObjectId refs like Jobnode)
    if (updates.skills) {
      if (typeof updates.skills === "string") {
        updates.skills = updates.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // ── Location: state + city → "City, State" string ────────────────────
    // Handyman.location is a simple String (not structured like Jobnode)
    if (updates.state || updates.city) {
      const parts = [updates.city?.trim(), updates.state?.trim()].filter(
        Boolean,
      );
      updates.location = parts.join(", ");
      delete updates.state;
      delete updates.city;
    }
    // Drop the redundant "location" string the form also appends
    // (we built it from state+city above)
    // Only delete if we already set it from state/city; if neither arrived
    // but a plain location string did, keep it.

    updates.onboardingComplete = true;

    const updated = await Handyman.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true },
    );
    if (!updated)
      return res.status(404).json({ message: "Handyman not found" });

    return res.status(200).json({
      message: "Onboarding updated",
      user: sanitize(updated),
    });
  } catch (err) {
    console.error("❌ handyman onboarding:", err);
    res.status(500).json({ message: "Onboarding failed", error: err.message });
  }
};

// ── EMPLOYER ──────────────────────────────────────────────────────────────────
export const updateEmployerOnboarding = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = { ...req.body };

    // ── Logo upload ───────────────────────────────────────────────────────
    const logoUrl = getUploadedFileUrl(req, "logo");
    if (logoUrl) updates.logo = logoUrl;

    // ── Location: state + city → "City, State" string ────────────────────
    if (updates.state || updates.city) {
      const parts = [updates.city?.trim(), updates.state?.trim()].filter(
        Boolean,
      );
      updates.location = parts.join(", ");
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

    return res.status(200).json({
      message: "Onboarding updated",
      user: sanitize(updated),
    });
  } catch (err) {
    console.error("❌ employer onboarding:", err);
    res.status(500).json({ message: "Onboarding failed", error: err.message });
  }
};
