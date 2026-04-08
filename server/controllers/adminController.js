// controllers/adminController.js
import Jobnode from "../models/Jobnode.js";
import Handyman from "../models/Handyman.js";
import Employer from "../models/Employer.js";
import JobModel from "../models/job.model.js";
import JobseekerApplication from "../models/JobseekerApplication.js";
import ContactMessage from "../models/ContactMessage.js";

// ── Middleware: verify superadmin from localStorage-issued token ─────────────
// The superadmin uses a Bearer token (not a cookie). verifyToken checks cookies.
// We use a separate lightweight check here.
import jwt from "jsonwebtoken";

export const verifySuperAdmin = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden — superadmin only" });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// GET /api/superadmin/metrics
export const getPlatformMetrics = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalJobseekers,
      totalHandymen,
      totalEmployers,
      totalJobs,
      totalApplications,
      newJobseekers,
      newHandymen,
      newEmployers,
      unreadMessages,
    ] = await Promise.all([
      Jobnode.countDocuments(),
      Handyman.countDocuments(),
      Employer.countDocuments(),
      JobModel.countDocuments(),
      JobseekerApplication.countDocuments(),
      Jobnode.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Handyman.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Employer.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      ContactMessage.countDocuments({ status: "unread" }).catch(() => 0),
    ]);

    const totalUsers = totalJobseekers + totalHandymen + totalEmployers;
    const newUsersLast7Days = newJobseekers + newHandymen + newEmployers;

    return res.json({
      totalUsers,
      totalJobseekers,
      totalHandymen,
      totalEmployers,
      totalJobs,
      activeJobs: totalJobs, // extend with status filter when status field is added
      totalApplications,
      newUsersLast7Days,
      unreadContactMessages: unreadMessages,
    });
  } catch (err) {
    console.error("❌ Metrics error:", err);
    return res.status(500).json({ message: "Failed to fetch metrics" });
  }
};

// GET /api/superadmin/users?role=jobseeker&search=&page=1&limit=10
export const getAllUsers = async (req, res) => {
  try {
    const { role, search = "", page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const buildQuery = (searchStr) => {
      if (!searchStr.trim()) return {};
      const re = new RegExp(searchStr.trim(), "i");
      return { $or: [{ fullName: re }, { email: re }] };
    };

    const query = buildQuery(search);

    let users = [];
    let total = 0;

    if (!role || role === "all") {
      // Fetch from all 3 collections and merge
      const [seekers, handymen, employers] = await Promise.all([
        Jobnode.find(query)
          .select("fullName email role createdAt banned")
          .lean(),
        Handyman.find(query)
          .select("fullName email role createdAt banned")
          .lean(),
        Employer.find(query)
          .select("fullName email companyName role createdAt banned")
          .lean(),
      ]);
      const all = [...seekers, ...handymen, ...employers].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      total = all.length;
      users = all.slice(skip, skip + limitNum);
    } else if (role === "jobseeker") {
      total = await Jobnode.countDocuments(query);
      users = await Jobnode.find(query)
        .select("fullName email role createdAt banned")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    } else if (role === "handyman") {
      total = await Handyman.countDocuments(query);
      users = await Handyman.find(query)
        .select("fullName email role createdAt banned")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    } else if (role === "employer") {
      total = await Employer.countDocuments(query);
      users = await Employer.find(query)
        .select("fullName email companyName role createdAt banned")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();
    } else {
      return res.status(400).json({ message: "Invalid role filter" });
    }

    return res.json({
      users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("❌ Get users error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/superadmin/users/:id/ban  { banned: true|false, role: "jobseeker" }
export const banUser = async (req, res) => {
  try {
    const { banned, role } = req.body;
    const { id } = req.params;

    if (typeof banned !== "boolean") {
      return res.status(400).json({ message: "banned must be a boolean" });
    }

    let Model;
    // Try all models if role not provided
    const tryModels = [Jobnode, Handyman, Employer];
    let updated = null;

    for (const M of tryModels) {
      updated = await M.findByIdAndUpdate(id, { banned }, { new: true }).select(
        "fullName email role banned",
      );
      if (updated) break;
    }

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: `User ${banned ? "banned" : "unbanned"} successfully`,
      user: updated,
    });
  } catch (err) {
    console.error("❌ Ban user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/superadmin/users/:id  — hard delete (use with care)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const tryModels = [Jobnode, Handyman, Employer];
    let deleted = false;

    for (const M of tryModels) {
      const result = await M.findByIdAndDelete(id);
      if (result) {
        deleted = true;
        break;
      }
    }

    if (!deleted) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
