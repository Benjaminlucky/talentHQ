// ── Environment validation MUST run first ─────────────────────────────────────
// Import dotenv before checkEnv so .env is loaded when we validate.
import dotenv from "dotenv";
dotenv.config();

import { checkEnv } from "./utils/env-check.js";
checkEnv(); // Crashes with a clear message if JWT_SECRET, MONGO_URI, or RESEND_API_KEY missing

// ── All other imports ─────────────────────────────────────────────────────────
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

// Routes
import employerRoutes from "./routes/employerRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/auth.js";
import onboardingRoutes from "./routes/OnboardingRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import jobseekerApplicationRoutes from "./routes/JobseekerApplicationsRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Ensure local upload folder exists
const resumePath = "./uploads/resumes";
if (!fs.existsSync(resumePath)) {
  fs.mkdirSync(resumePath, { recursive: true });
}

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        process.env.FRONTEND_URL || "https://talenthq.netlify.app",
        "https://talenthq-1.onrender.com",
      ]
    : ["http://localhost:3000", "http://localhost:5000"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

// ── Rate limiters ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please wait a few minutes." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please wait 15 minutes." },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many messages submitted. Please wait before sending again.",
  },
});

app.use(globalLimiter);

// Static files (dev only)
if (process.env.NODE_ENV !== "production") {
  const __dirname = path.resolve();
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/superadmin", authLimiter, superAdminRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/api/superadmin", adminRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profile", jobseekerApplicationRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred."
        : err.message,
  });
});

// ── MongoDB + startup ─────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    console.log("✅ MongoDB connected");

    try {
      const db = mongoose.connection.db;
      // Core indexes
      await db
        .collection("jobnodes")
        .createIndex({ email: 1 }, { unique: true, background: true });
      await db
        .collection("jobnodes")
        .createIndex({ createdAt: -1 }, { background: true });
      await db
        .collection("handymen")
        .createIndex({ email: 1 }, { unique: true, background: true });
      await db
        .collection("employers")
        .createIndex({ email: 1 }, { unique: true, background: true });
      await db
        .collection("jobs")
        .createIndex({ category: 1 }, { background: true });
      await db
        .collection("jobs")
        .createIndex({ createdAt: -1 }, { background: true });
      await db
        .collection("jobs")
        .createIndex(
          { title: "text", description: "text" },
          { background: true },
        );
      await db
        .collection("applications")
        .createIndex({ jobseeker: 1 }, { background: true });
      await db
        .collection("applications")
        .createIndex({ status: 1 }, { background: true });
      // Auth indexes
      await db
        .collection("emailtokens")
        .createIndex({ token: 1 }, { background: true });
      await db
        .collection("emailtokens")
        .createIndex(
          { expiresAt: 1 },
          { expireAfterSeconds: 0, background: true },
        );
      await db
        .collection("sessions")
        .createIndex({ tokenHash: 1 }, { background: true });
      await db
        .collection("sessions")
        .createIndex({ userId: 1 }, { background: true });
      await db
        .collection("sessions")
        .createIndex(
          { expiresAt: 1 },
          { expireAfterSeconds: 0, background: true },
        );
      console.log("✅ Database indexes ensured");
    } catch (indexErr) {
      console.warn("⚠️  Index warning (non-fatal):", indexErr.message);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
      );
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
