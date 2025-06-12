import bcrypt from "bcrypt"; // Use bcryptjs for compatibility
import jwt from "jsonwebtoken";
import JobseekerModel from "../models/Jobseeker.model.js";

export const signupJobSeeker = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      whatsapp,
      password,
      state,
      lga,
      location,
      jobCategory,
      experienceLevel,
      currentStatus,
      linkedin,
      portfolio,
      jobType,
      expectedSalary,
      skills,
      education,
      workSummary,
      agreeToTerms,
    } = req.body;

    // ✅ Handle uploaded resume
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : "";

    // ✅ Validate required fields
    if (!fullName || !email || !password || !agreeToTerms) {
      return res.status(400).json({
        message:
          "Full name, email, password and agreement to terms are required.",
      });
    }

    const existingUser = await JobseekerModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newJobSeeker = new JobseekerModel({
      fullName,
      email,
      phone,
      whatsapp,
      password: hashedPassword,
      state,
      lga,
      location,
      jobCategory,
      experienceLevel,
      currentStatus,
      linkedin,
      portfolio,
      jobType: Array.isArray(jobType) ? jobType : [jobType],
      expectedSalary,
      skills,
      education,
      workSummary,
      resumeUrl,
      agreeToTerms,
    });

    await newJobSeeker.save();

    const token = jwt.sign(
      { id: newJobSeeker._id, role: newJobSeeker.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "Job seeker account created successfully.",
      jobSeeker: {
        id: newJobSeeker._id,
        fullName: newJobSeeker.fullName,
        email: newJobSeeker.email,
        role: newJobSeeker.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
};
