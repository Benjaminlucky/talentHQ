import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import Education from "../models/Education.js"; // ✅ add
import Skill from "../models/Skill.js"; // ✅ add
import Certification from "../models/Certification.js"; // ✅ add
import Project from "../models/Project.js"; // ✅ add
import Workexperience from "../models/Workexperience.js"; // ✅ add

const sanitize = (doc) => {
  if (!doc) return null;
  const { password, __v, ...rest } = doc.toObject ? doc.toObject() : doc;
  return rest;
};

// PATCH /api/onboarding/jobseeker
export const updateJobSeekerOnboarding = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = { ...req.body };

    // ✅ Resume handling (Cloudinary or local)
    if (req.file) {
      if (req.file.path) {
        updates.resume = req.file.path; // Cloudinary
      } else if (req.file.filename) {
        const BASE_URL =
          process.env.NODE_ENV === "production"
            ? process.env.RENDER_EXTERNAL_URL ||
              "https://talenthq-1.onrender.com"
            : "http://localhost:5000";
        updates.resume = `${BASE_URL}/uploads/resumes/${req.file.filename}`;
      }
    }

    // ✅ Normalize skills
    if (updates.skills) {
      let skillsArr = [];
      if (typeof updates.skills === "string") {
        skillsArr = updates.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (Array.isArray(updates.skills)) {
        skillsArr = updates.skills.filter(Boolean);
      }

      // Save new skills as documents if they're not ObjectIds
      const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      updates.skill = await Promise.all(
        skillsArr.map(async (s) => {
          if (isObjectId(s)) return s;
          const skillDoc = await Skill.create({
            user: userId,
            name: s,
            level: "Beginner",
          });
          return skillDoc._id;
        })
      );
      delete updates.skills;
    }

    // ✅ Normalize education
    if (updates.education) {
      let eduArr = Array.isArray(updates.education)
        ? updates.education
        : [updates.education];

      const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      updates.education = await Promise.all(
        eduArr.map(async (e) => {
          if (isObjectId(e)) return e;
          const eduDoc = await Education.create({
            user: userId,
            degree: e,
            institution: "Unknown",
          });
          return eduDoc._id;
        })
      );
    }

    // ✅ Normalize certifications
    if (updates.certifications) {
      let certArr = Array.isArray(updates.certifications)
        ? updates.certifications
        : [updates.certifications];

      const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      updates.certifications = await Promise.all(
        certArr.map(async (c) => {
          if (isObjectId(c)) return c;
          const certDoc = await Certification.create({
            user: userId,
            title: c,
            organization: "Unknown",
            dateEarned: new Date(),
          });
          return certDoc._id;
        })
      );
    }

    // ✅ Normalize projects
    if (updates.projects) {
      let projArr = Array.isArray(updates.projects)
        ? updates.projects
        : [updates.projects];

      const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      updates.projects = await Promise.all(
        projArr.map(async (p) => {
          if (isObjectId(p)) return p;
          const projDoc = await Project.create({
            user: userId,
            title: p,
            description: "",
          });
          return projDoc._id;
        })
      );
    }

    // ✅ Normalize workExperience
    if (updates.workExperience) {
      let workArr = Array.isArray(updates.workExperience)
        ? updates.workExperience
        : [updates.workExperience];

      const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      updates.workExperience = await Promise.all(
        workArr.map(async (w) => {
          if (isObjectId(w)) return w;
          const workDoc = await Workexperience.create({
            user: userId,
            company: w,
          });
          return workDoc._id;
        })
      );
    }

    const updated = await Jobnode.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
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

// PATCH /api/onboarding/handyman
export const updateHandymanOnboarding = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = { ...req.body };

    if (updates.yearsExperience) {
      const n = Number(updates.yearsExperience);
      updates.yearsExperience = Number.isNaN(n) ? 0 : n;
    }

    const updated = await Handyman.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
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

// PATCH /api/onboarding/employer
export const updateEmployerOnboarding = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updates = { ...req.body };

    const updated = await Employer.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
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
