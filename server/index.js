import dotenv from "dotenv";
dotenv.config();

import { checkEnv } from "./utils/env-check.js";
checkEnv();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session"; // needed by passport for the OAuth handshake only
import { rateLimit } from "express-rate-limit";
import passportMiddleware from "./middlewares/passport.js";

// Routes
import authRoutes from "./routes/auth.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import employerRoutes from "./routes/employerRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import onboardingRoutes from "./routes/OnboardingRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import jobseekerApplicationRoutes from "./routes/JobseekerApplicationsRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import interviewRoutes from "./routes/interviewroutes.js";
import handymanRoutes from "./routes/handymanRoutes.js";
import notificationRoutes from "./routes/notificationoutes.js";

const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Passport needs a minimal session for the OAuth handshake redirect (not for auth state —
// we use JWT for that). The session is ephemeral and stores nothing sensitive.
app.use(
  session({
    secret: process.env.JWT_SECRET, // reuse your existing secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 * 1000, // 5 minutes — just long enough for the OAuth dance
    },
  }),
);
app.use(passportMiddleware.initialize());
app.use(passportMiddleware.session());

// Ensure upload folders exist
const resumePath = "./uploads/resumes";
if (!fs.existsSync(resumePath)) fs.mkdirSync(resumePath, { recursive: true });

// ── CORS ──────────────────────────────────────────────────────────────────────
// Normalize: strip trailing slash so "https://talenthq.buzz/" and
// "https://talenthq.buzz" both match correctly.
const normalizeOrigin = (o) => (o ? o.replace(/\/$/, "") : o);

const PRODUCTION_ORIGINS = [
  process.env.FRONTEND_URL, // primary — set this in Render env vars
  "https://talenthq.buzz", // custom domain
  "https://www.talenthq.buzz", // www variant
  "https://talenthq.netlify.app", // Netlify subdomain (OAuth redirects here)
]
  .filter(Boolean)
  .map(normalizeOrigin);

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? PRODUCTION_ORIGINS
    : ["http://localhost:3000", "http://localhost:5000"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(normalizeOrigin(origin)))
        return callback(null, true);
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
  message: { message: "Too many messages. Please wait before sending again." },
});

app.use(globalLimiter);

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

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auth", oauthRoutes); // Google + LinkedIn OAuth (no rate limit — Google handles abuse)
app.use("/api/superadmin", authLimiter, superAdminRoutes);
app.use("/api/contact", contactLimiter, contactRoutes);
app.use("/api/superadmin", adminRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profile", jobseekerApplicationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/handymen", handymanRoutes);
app.use("/api/notifications", notificationRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err.message);
  if (err.message?.startsWith("CORS:"))
    return res.status(403).json({ message: err.message });
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
        .createIndex(
          { oauthProvider: 1, oauthId: 1 },
          { sparse: true, background: true },
        );
      await db
        .collection("handymen")
        .createIndex({ email: 1 }, { unique: true, background: true });
      await db
        .collection("handymen")
        .createIndex(
          { oauthProvider: 1, oauthId: 1 },
          { sparse: true, background: true },
        );
      await db
        .collection("employers")
        .createIndex({ email: 1 }, { unique: true, background: true });
      await db
        .collection("employers")
        .createIndex(
          { oauthProvider: 1, oauthId: 1 },
          { sparse: true, background: true },
        );
      await db
        .collection("jobs")
        .createIndex({ category: 1 }, { background: true });
      await db
        .collection("jobs")
        .createIndex({ createdAt: -1 }, { background: true });
      // Text index omitted — MongoDB already has title+description+skills text index.
      // Only one text index allowed per collection; existing one is better.
      await db
        .collection("applications")
        .createIndex({ jobseeker: 1 }, { background: true });
      // Auth/session indexes
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
    } catch (e) {
      console.warn("⚠️  Index warning (non-fatal):", e.message);
    }
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(
        `🚀 Server on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
      ),
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
