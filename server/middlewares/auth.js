import crypto from "crypto";
import jwt from "jsonwebtoken";
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import Session from "../models/Session.js";

const findUserById = async (id, role) => {
  switch (role) {
    case "jobseeker":
      return Jobnode.findById(id).lean();
    case "handyman":
      return Handyman.findById(id).lean();
    case "employer":
      return Employer.findById(id).lean();
    default:
      return null;
  }
};

export const verifyToken = async (req, res, next) => {
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if this session has been revoked (e.g. via password reset or manual logout)
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await Session.findOne({ tokenHash }).lean();

    if (!session || session.revoked) {
      return res
        .status(401)
        .json({ message: "Session expired or revoked. Please log in again." });
    }

    const user = await findUserById(decoded.id, decoded.role);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.banned) {
      return res.status(403).json({ message: "Account suspended" });
    }

    // Update lastSeenAt (fire-and-forget, don't block request)
    Session.findByIdAndUpdate(session._id, { lastSeenAt: new Date() }).catch(
      () => {},
    );

    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
