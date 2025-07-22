import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import EmployerModel from "../models/Employer.model.js";

// ✅ Employer Signup
export const signupEmployer = async (req, res) => {
  try {
    const {
      companyName,
      industry,
      companySize,
      state,
      lga,
      address,
      companyEmail,
      phoneNumber,
      website,
      linkedin,
      cacNumber,
      password,
      contactPersonName,
      contactPersonDesignation,
      contactPersonEmail,
      contactPersonPhone,
      agreeToTerms,
      logo,
    } = req.body;

    if (!companyName || !companyEmail || !password || !agreeToTerms) {
      return res.status(400).json({
        message:
          "Company name, email, password, and agreement to terms are required.",
      });
    }

    const existingUser = await EmployerModel.findOne({ companyEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployer = new EmployerModel({
      companyName,
      industry,
      companySize,
      state,
      lga,
      address,
      companyEmail,
      phoneNumber,
      website,
      linkedin,
      cacNumber,
      password: hashedPassword,
      logo, // should already be base64 string from frontend
      contactPersonName,
      contactPersonDesignation,
      contactPersonEmail,
      contactPersonPhone,
      agreeToTerms,
    });

    await newEmployer.save();

    const token = jwt.sign(
      { id: newEmployer._id, role: "employer" },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "Employer registered successfully.",
      employer: {
        id: newEmployer._id,
        companyName: newEmployer.companyName,
        companyEmail: newEmployer.companyEmail,
        role: "employer",
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed." });
  }
};

// ✅ Employer Login
export const loginEmployer = async (req, res) => {
  try {
    const { companyEmail, password } = req.body;

    const employer = await EmployerModel.findOne({ companyEmail });
    if (!employer) {
      return res
        .status(404)
        .json({ message: "No employer found with this email." });
    }

    const isMatch = await bcrypt.compare(password, employer.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const accessToken = jwt.sign(
      { id: employer._id, role: "employer" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: employer._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    employer.refreshToken = refreshToken;
    await employer.save();

    res.status(200).json({
      message: "Login successful.",
      accessToken,
      refreshToken,
      employer: {
        id: employer._id,
        companyName: employer.companyName,
        companyEmail: employer.companyEmail,
        role: "employer",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed." });
  }
};

// ✅ Refresh Token
export const refreshEmployerToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Token required." });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const employer = await EmployerModel.findById(decoded.id);

    if (!employer || employer.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid token." });
    }

    const newAccessToken = jwt.sign(
      { id: employer._id, role: "employer" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Token invalid or expired." });
  }
};

// ✅ Logout
export const logoutEmployer = async (req, res) => {
  try {
    const { id } = req.body;

    const employer = await EmployerModel.findById(id);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found." });
    }

    employer.refreshToken = null;
    await employer.save();

    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed." });
  }
};

// ✅ Protected Employer Dashboard
export const getEmployerDashboard = async (req, res) => {
  try {
    const employer = await EmployerModel.findById(req.user.id).select(
      "-password -refreshToken"
    );
    if (!employer) {
      return res.status(404).json({ message: "Employer not found." });
    }

    res.status(200).json({
      message: "Welcome to your dashboard.",
      employer,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard." });
  }
};
