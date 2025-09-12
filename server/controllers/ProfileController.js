import Certification from "../models/Certification.js";
import Education from "../models/Education.js";
import Jobnode from "../models/Jobnode.js";

import Project from "../models/Project.js";

import Skill from "../models/Skill.js";
import Workexperience from "../models/Workexperience.js";

// ✅ GET full profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // base jobseeker info
    const jobseeker = await Jobnode.findById(userId).select("-password -__v");
    if (!jobseeker) {
      return res.status(404).json({ message: "Jobseeker not found" });
    }

    // fetch referenced data
    const [skills, certifications, work, education, projects] =
      await Promise.all([
        Skill.find({ user: userId }),
        Certification.find({ user: userId }),
        Workexperience.find({ user: userId }),
        Education.find({ user: userId }),
        Project.find({ user: userId }),
      ]);

    // ✅ ensure backward compatibility for location
    const jobseekerObj = jobseeker.toObject();

    if (typeof jobseekerObj.location === "string") {
      // convert old string location to structured object
      jobseekerObj.location = {
        country: jobseekerObj.location,
        city: "",
        area: "",
      };
    } else {
      // ensure object exists
      jobseekerObj.location = jobseekerObj.location || {
        area: "",
        city: "",
        country: "",
      };
    }

    res.json({
      ...jobseekerObj,
      skills,
      certifications,
      workExperience: work,
      education,
      projects,
    });
  } catch (err) {
    console.error("❌ getMyProfile error:", err);
    res.status(500).json({
      message: "Failed to fetch profile",
      error: err.message,
    });
  }
};

// ✅ Update base jobseeker profile
// UPDATE my profile
export const updateMyProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    // ✅ Handle location being either string or object
    if (updates.location) {
      if (typeof updates.location === "object") {
        // normalize to object { country, city, area }
        updates.location = {
          country: updates.location.country || "",
          city: updates.location.city || "",
          area: updates.location.area || "",
        };
      } else if (typeof updates.location === "string") {
        // keep it as string if that's how it's sent
        updates.location = updates.location.trim();
      }
    }

    const profile = await Jobnode.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!profile) return res.status(404).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// controllers/ProfileController.js
// controllers/ProfileController.js
// controllers/ProfileController.js

export const updateResume = async (req, res) => {
  try {
    // Handle Multer file errors (file size, invalid type, etc.)
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✅ If file is too large, Multer will throw LIMIT_FILE_SIZE
    if (req.fileSizeLimitError) {
      return res
        .status(400)
        .json({ message: "File too large. Max size is 10MB." });
    }

    const filePath = `/uploads/resumes/${req.file.filename}`;

    const user = await Jobnode.findByIdAndUpdate(
      req.user.id,
      { resume: filePath },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    // Catch Multer errors specifically
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Max size is 10MB." });
    }

    res
      .status(500)
      .json({ message: "Resume upload failed", error: err.message });
  }
};
