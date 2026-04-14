// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Check email across all 3 collections in parallel — fast */
const emailExistsAnywhere = async (email) => {
  const [j, h, e] = await Promise.all([
    Jobnode.findOne({ email }).lean(),
    Handyman.findOne({ email }).lean(),
    Employer.findOne({ email }).lean(),
  ]);
  return Boolean(j || h || e);
};

/** Strip sensitive fields from any user object (works on both mongoose docs and plain objects) */
const sanitize = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  delete obj.__v;
  delete obj.refreshToken;
  return obj;
};

/** Find user across all 3 collections in parallel — login doesn't know the role upfront */
const findUserByEmail = async (email) => {
  const [j, h, e] = await Promise.all([
    Jobnode.findOne({ email }),
    Handyman.findOne({ email }),
    Employer.findOne({ email }),
  ]);
  return j || h || e || null;
};

const findUserById = async (id, role) => {
  switch (role) {
    case "jobseeker":
      return Jobnode.findById(id).select("-password -__v -refreshToken").lean();
    case "handyman":
      return Handyman.findById(id)
        .select("-password -__v -refreshToken")
        .lean();
    case "employer":
      return Employer.findById(id)
        .select("-password -__v -refreshToken")
        .lean();
    default:
      return null;
  }
};

/** Issue JWT and set httpOnly cookie */
const issueToken = (res, user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true, // not accessible via JS
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-origin in prod (Render→Netlify)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return token;
};

// ── POST /api/auth/signup2 ────────────────────────────────────────────────────
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
      agreedToTerms,
      agreedAt,
    } = req.body;

    // ── Input validation ────────────────────────────────────────────────────
    if (!role || !["jobseeker", "handyman", "employer"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!fullName?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Full name, email and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }
    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Cross-collection email uniqueness ───────────────────────────────────
    if (await emailExistsAnywhere(normalizedEmail)) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 12); // 12 rounds — stronger than the old 10

    let created;
    if (role === "jobseeker") {
      created = await Jobnode.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashed,
        role: "jobseeker",
      });
    } else if (role === "handyman") {
      let skillsArr = [];
      if (Array.isArray(skills)) skillsArr = skills.filter(Boolean);
      else if (typeof skills === "string" && skills.trim()) {
        skillsArr = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      created = await Handyman.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashed,
        role: "handyman",
        skills: skillsArr,
        location: location?.trim() || "",
      });
    } else {
      created = await Employer.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashed,
        role: "employer",
        companyName: companyName?.trim() || "",
        companyWebsite: companyWebsite?.trim() || "",
      });
    }

    issueToken(res, created);

    return res.status(201).json({
      message: "Account created successfully",
      user: sanitize(created),
    });
  } catch (err) {
    console.error("❌ signup2:", err);
    res.status(500).json({ message: "Signup failed. Please try again." });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Search all 3 collections in parallel
    const user = await findUserByEmail(normalizedEmail);

    // Use constant-time compare even if user not found (prevents timing attacks)
    // We hash a dummy string so bcrypt.compare always runs
    const dummyHash =
      "$2b$12$invalidhashusedfortimingprotectiononly1234567890abcdef";
    const isMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !isMatch) {
      // Same message for both cases — prevents email enumeration
      return res.status(401).json({ message: "Invalid email or password" });
    }

    issueToken(res, user);

    return res.status(200).json({
      message: "Login successful",
      user: sanitize(user),
    });
  } catch (err) {
    console.error("❌ login:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;
    const user = await findUserById(id, role); // already selects out password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("❌ getMe:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
