import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

// helper: check unique email across all 3 collections
const emailExistsAnywhere = async (email) => {
  const [j, h, e] = await Promise.all([
    Jobnode.findOne({ email }).lean(),
    Handyman.findOne({ email }).lean(),
    Employer.findOne({ email }).lean(),
  ]);
  return Boolean(j || h || e);
};

const sanitize = (doc) => {
  if (!doc) return null;
  const { password, __v, ...rest } = doc.toObject ? doc.toObject() : doc;
  return rest;
};

// POST /api/auth/signup2
export const signup2 = async (req, res) => {
  try {
    const {
      role,
      fullName,
      email,
      password,
      // handyman extras
      skills,
      location,
      // employer extras
      companyName,
      companyWebsite,
    } = req.body;

    if (!role || !["jobseeker", "handyman", "employer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // unique email across all role collections
    if (await emailExistsAnywhere(email)) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);
    let created;

    if (role === "jobseeker") {
      created = await Jobnode.create({
        fullName,
        email,
        password: hashed,
        role: "jobseeker",
      });
    } else if (role === "handyman") {
      let skillsArr = [];
      if (Array.isArray(skills)) skillsArr = skills;
      else if (typeof skills === "string" && skills.trim().length) {
        skillsArr = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      created = await Handyman.create({
        fullName,
        email,
        password: hashed,
        role: "handyman",
        skills: skillsArr,
        location: location || "",
      });
    } else if (role === "employer") {
      created = await Employer.create({
        fullName,
        email,
        password: hashed,
        role: "employer",
        companyName: companyName || "",
        companyWebsite: companyWebsite || "",
      });
    }

    // JWT cookie
    const token = jwt.sign({ id: created._id, role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Signup successful",
      user: sanitize(created),
    });
  } catch (err) {
    console.error("❌ signup2 error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔎 Search user across collections
    let user =
      (await Jobnode.findOne({ email })) ||
      (await Handyman.findOne({ email })) ||
      (await Employer.findOne({ email }));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔑 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🎟️ Generate JWT with role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🍪 Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        fullName: user.fullName, // ✅ added
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const getMe = (req, res) => {
  try {
    const user = req.user; // set by verifyToken middleware
    res.status(200).json({
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName, // ✅ added
      },
    });
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};
