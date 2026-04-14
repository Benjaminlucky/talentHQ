// middlewares/auth.js
import jwt from "jsonwebtoken";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import SuperAdmin from "../models/superAdmin.model.js";

const findUserById = async (id, role) => {
  switch (role) {
    case "jobseeker":
      return await Jobnode.findById(id).lean();
    case "handyman":
      return await Handyman.findById(id).lean();
    case "employer":
      return await Employer.findById(id).lean();
    case "superadmin":
      return await SuperAdmin.findById(id).lean();
    default:
      return null;
  }
};

export const verifyToken = async (req, res, next) => {
  // Accept token from cookie OR Authorization header (Bearer <token>)
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id, decoded.role);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user._id, role: decoded.role || user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
