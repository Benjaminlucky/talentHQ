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

// controllers/jobSeekerController.js  Login
export const loginJobSeeker = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });

    const jobSeeker = await JobseekerModel.findOne({ email });
    if (!jobSeeker)
      return res
        .status(404)
        .json({ message: "No account found with this email." });

    const isMatch = await bcrypt.compare(password, jobSeeker.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password." });

    const accessToken = jwt.sign(
      { id: jobSeeker._id, role: jobSeeker.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: jobSeeker._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Save refreshToken to DB
    jobSeeker.refreshToken = refreshToken;
    await jobSeeker.save();

    res.status(200).json({
      message: "Login successful.",
      accessToken,
      refreshToken,
      jobSeeker: {
        id: jobSeeker._id,
        fullName: jobSeeker.fullName,
        email: jobSeeker.email,
        role: jobSeeker.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login." });
  }
};

/// JOB SEEKER REFRESH ACCESS TOKEN

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user and validate refreshToken from DB
    const jobSeeker = await JobseekerModel.findById(decoded.id);
    if (!jobSeeker || jobSeeker.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const newAccessToken = jwt.sign(
      { id: jobSeeker._id, role: jobSeeker.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token." });
  }
};

/// JOB SEEKER LOGOUT CONTROLLER

export const logoutJobSeeker = async (req, res) => {
  try {
    const { id } = req.body;

    const jobSeeker = await JobseekerModel.findById(id);
    if (!jobSeeker) {
      return res.status(404).json({ message: "User not found." });
    }

    jobSeeker.refreshToken = null;
    await jobSeeker.save();

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed." });
  }
};
