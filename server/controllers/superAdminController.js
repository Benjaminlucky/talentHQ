import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import SuperAdmin from "../models/superAdmin.model.js";

// Environment secret
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

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

    const newAdmin = await SuperAdmin.create({
      fullName,
      email,
      password: hashedPassword,
    });

    return res
      .status(201)
      .json({ message: "Super Admin registered successfully." });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await SuperAdmin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { id: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: admin._id, role: admin.role },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

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
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

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

      const accessToken = jwt.sign(
        { id: admin._id, role: admin.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({ accessToken });
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};

export const logoutSuperAdmin = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const admin = await SuperAdmin.findOne({ refreshToken });
    if (!admin) return res.status(204).send();

    admin.refreshToken = "";
    await admin.save();

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};
