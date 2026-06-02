// controllers/ProfileController.js
import Certification from "../models/Certification.js";
import Education from "../models/Education.js";
import Jobnode from "../models/Jobnode.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import Workexperience from "../models/Workexperience.js";
import cloudinary from "../middlewares/cloudinary.js";

// ✅ GET full profile
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const jobseeker = await Jobnode.findById(userId).select("-password -__v");
    if (!jobseeker) {
      return res.status(404).json({ message: "Jobseeker not found" });
    }

    const [skills, certifications, work, education, projects] =
      await Promise.all([
        Skill.find({ user: userId }),
        Certification.find({ user: userId }),
        Workexperience.find({ user: userId }),
        Education.find({ user: userId }),
        Project.find({ user: userId }),
      ]);

    const jobseekerObj = jobseeker.toObject();

    // ✅ ensure backward compatibility for location
    if (typeof jobseekerObj.location === "string") {
      jobseekerObj.location = {
        country: jobseekerObj.location,
        city: "",
        area: "",
      };
    } else {
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
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
};

// ✅ Update base jobseeker profile
export const updateMyProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    // ✅ Normalize location
    if (updates.location) {
      if (typeof updates.location === "object") {
        updates.location = {
          country: updates.location.country || "",
          city: updates.location.city || "",
          area: updates.location.area || "",
        };
      } else if (typeof updates.location === "string") {
        updates.location = updates.location.trim();
      }
    }

    // ✅ Handle avatar (Base64 → Cloudinary)
    if (updates.avatar && updates.avatar.startsWith("data:image")) {
      try {
        const uploadRes = await cloudinary.uploader.upload(updates.avatar, {
          folder: "talenthq/avatars",
          public_id: `avatar_${req.user.id}`,
          overwrite: true,
          transformation: [
            { width: 500, height: 500, crop: "fill", quality: "auto:good" },
          ],
        });
        updates.avatar = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error("❌ Avatar upload failed:", uploadErr);
        return res.status(500).json({ message: "Avatar upload failed" });
      }
    }

    const profile = await Jobnode.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!profile) {
      return res.status(404).json({ message: "Jobseeker not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("❌ updateMyProfile error:", err);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};

// ✅ Update resume
// FIX: In production the smart Cloudinary storage sets req.file.path to the
// full secure_url (https://res.cloudinary.com/.../talenthq/resumes/...).
// Previously this built "/uploads/resumes/<cloudinaryPublicId>" which is a
// dead link in production. Now we use req.file.path when present (Cloudinary),
// and fall back to the local /uploads path in development — mirroring the
// logic already used in OnboardingController.getUploadedFileUrl.
export const updateResume = async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (req.fileSizeLimitError) {
      return res
        .status(400)
        .json({ message: "File too large. Max size is 10MB." });
    }

    // Cloudinary (production): req.file.path is the full secure_url.
    // Local disk (development): build the public /uploads path from filename.
    let filePath;
    if (req.file.path && /^https?:\/\//i.test(req.file.path)) {
      filePath = req.file.path; // Cloudinary secure_url
    } else if (req.file.filename) {
      filePath = `/uploads/resumes/${req.file.filename}`; // local dev
    } else if (req.file.path) {
      filePath = req.file.path; // any other absolute path multer provides
    } else {
      return res
        .status(400)
        .json({ message: "Could not resolve uploaded file" });
    }

    const user = await Jobnode.findByIdAndUpdate(
      req.user.id,
      { resume: filePath },
      { new: true },
    );

    res.json(user);
  } catch (err) {
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
