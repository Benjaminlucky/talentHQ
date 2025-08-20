// controllers/superAdminController.js
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import SuperAdmin from "../models/superAdmin.model.js";

// Use env, with safe fallbacks so the app never crashes if .env isn't loaded early enough
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret";

const signAccessToken = (admin) =>
  jwt.sign({ id: admin._id, role: "superadmin" }, JWT_SECRET, {
    expiresIn: "1h",
  });

const signRefreshToken = (admin) =>
  jwt.sign({ id: admin._id, role: "superadmin" }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

// POST /api/superadmin/register
export const registerSuperAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingAdmin = await SuperAdmin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await SuperAdmin.create({
      fullName,
      email,
      password: hashedPassword,
      // ensure role is set in your model schema default; otherwise uncomment next line:
      // role: "superadmin",
    });

    return res
      .status(201)
      .json({ message: "Super Admin registered successfully." });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST /api/superadmin/login
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await SuperAdmin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Ensure role in token payload is `superadmin`
    const accessToken = signAccessToken(admin);
    const refreshToken = signRefreshToken(admin);

    admin.refreshToken = refreshToken;
    await admin.save();

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      superadmin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role || "superadmin",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST /api/superadmin/refresh-token
export const refreshSuperAdminToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token required." });

  try {
    const admin = await SuperAdmin.findOne({ refreshToken });
    if (!admin)
      return res.status(403).json({ message: "Invalid refresh token." });

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err || decoded.id !== admin._id.toString()) {
        return res.status(403).json({ message: "Token verification failed." });
      }

      const accessToken = signAccessToken(admin);
      return res.status(200).json({ accessToken });
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST /api/superadmin/logout
// Accepts either { refreshToken } OR { id } in body for convenience
export const logoutSuperAdmin = async (req, res) => {
  try {
    const { refreshToken, id } = req.body;

    if (!refreshToken && !id) {
      return res
        .status(400)
        .json({ message: "refreshToken or id is required." });
    }

    let admin = null;
    if (refreshToken) {
      admin = await SuperAdmin.findOne({ refreshToken });
    } else if (id) {
      admin = await SuperAdmin.findById(id);
    }

    if (!admin) {
      // 204 so client can clear its tokens without error spam
      return res.status(204).send();
    }

    admin.refreshToken = null;
    await admin.save();

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
