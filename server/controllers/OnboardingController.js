import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

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

    // file (resume)
    if (req.file) {
      updates.resume = `/uploads/resumes/${req.file.filename}`;
    } else {
      delete updates.resume;
    }

    // skills: ensure array
    if (updates.skills && typeof updates.skills === "string") {
      updates.skills = updates.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
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
