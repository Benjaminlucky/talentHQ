import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import HandymanModel from "../models/handyman.model.js";

// ✅ Signup Handyman
export const signupHandyman = async (req, res) => {
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

    const resume = req.file ? `/uploads/resumes/${req.file.filename}` : "";

    // Validation
    if (!fullName || !email || !password || !agreeToTerms) {
      return res.status(400).json({
        message:
          "Full name, email, password and agreement to terms are required.",
      });
    }

    const existingUser = await HandymanModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newHandyman = new HandymanModel({
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
      expectedSalary: expectedSalary.toString(),
      skills: Array.isArray(skills) ? skills.join(", ") : skills,
      education,
      workSummary,
      resume,
      agreeToTerms,
    });

    await newHandyman.save();

    const token = jwt.sign(
      { id: newHandyman._id, role: newHandyman.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Handyman account created successfully.",
      handyman: {
        id: newHandyman._id,
        fullName: newHandyman.fullName,
        email: newHandyman.email,
        role: newHandyman.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
};

// ✅ Login Handyman
export const loginHandyman = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please provide both email and password." });

    const handyman = await HandymanModel.findOne({ email });
    if (!handyman)
      return res
        .status(404)
        .json({ message: "No account found with this email." });

    const isMatch = await bcrypt.compare(password, handyman.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password." });

    const accessToken = jwt.sign(
      { id: handyman._id, role: handyman.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: handyman._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token
    handyman.refreshToken = refreshToken;
    await handyman.save();

    res.status(200).json({
      message: "Login successful.",
      accessToken,
      refreshToken,
      handyman: {
        id: handyman._id,
        fullName: handyman.fullName,
        email: handyman.email,
        role: handyman.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login." });
  }
};

// ✅ Refresh Token
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const handyman = await HandymanModel.findById(decoded.id);
    if (!handyman || handyman.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const newAccessToken = jwt.sign(
      { id: handyman._id, role: handyman.role },
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

// ✅ Logout
export const logoutHandyman = async (req, res) => {
  try {
    const { id } = req.body;

    const handyman = await HandymanModel.findById(id);
    if (!handyman) {
      return res.status(404).json({ message: "User not found." });
    }

    handyman.refreshToken = null;
    await handyman.save();

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed." });
  }
};
