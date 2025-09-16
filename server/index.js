import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";
import cookieParser from "cookie-parser";

// Routes
import employerRoutes from "./routes/employerRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/auth.js";
import onboardingRoutes from "./routes/OnboardingRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import jobseekerApplicationRoutes from "./routes/JobseekerApplicationsRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Ensure uploads/resumes folder exists
const resumePath = "./uploads/resumes";
if (!fs.existsSync(resumePath)) {
  fs.mkdirSync(resumePath, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumePath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});
const upload = multer({ storage });

// ✅ Strict CORS config (no wildcard when credentials are used)
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://talenthq.netlify.app"]
    : ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman/cURL
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Static files
app.use("/uploads", express.static("uploads"));

// Root Route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Upload resume route
app.post("/api/upload-resume", upload.single("resume"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.status(200).json({
    message: "Resume uploaded successfully",
    filePath: `/uploads/resumes/${req.file.filename}`,
  });
});

// API Routes
app.use("/api/employers", employerRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profile", jobseekerApplicationRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  });
