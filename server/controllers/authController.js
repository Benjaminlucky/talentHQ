// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

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

const findUserById = async (id, role) => {
  switch (role) {
    case "jobseeker":
      return await Jobnode.findById(id).lean();
    case "handyman":
      return await Handyman.findById(id).lean();
    case "employer":
      return await Employer.findById(id).lean();
    default:
      return null;
  }
};

// helper: issue JWT + set cookie
const issueToken = (res, user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// POST /api/auth/signup2
export const signup2 = async (req, res) => {
  try {
    const {
      role,
      fullName,
      email,
      password,
      skills,
      location,
      companyName,
      companyWebsite,
    } = req.body;

    if (!role || !["jobseeker", "handyman", "employer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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

    issueToken(res, created);

    return res.status(201).json({
      message: "Signup successful",
      user: sanitize(created),
    });
  } catch (err) {
    console.error("❌ signup2 error:", err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user =
      (await Jobnode.findOne({ email })) ||
      (await Handyman.findOne({ email })) ||
      (await Employer.findOne({ email }));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    issueToken(res, user);

    res.status(200).json({
      message: "Login successful",
      user: sanitize(user),
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    const user = await findUserById(id, role);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: sanitize(user) });
  } catch (err) {
    console.error("❌ getMe error:", err);
    res.status(500).json({ message: "Server error" });
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
