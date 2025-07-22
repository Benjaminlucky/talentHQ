import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";
import jobSeekerRoutes from "./routes/jobSeekerRoutes.js";
import handymanRoutes from "./routes/handymanRoutes.js";
import employerRoutes from "./routes/employerRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";

dotenv.config();

const app = express();

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

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // optional: serve static files

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
app.use("/api/jobseekers", jobSeekerRoutes);
app.use("/api/handyman", handymanRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/superadmin", superAdminRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    // Start Server Only After DB Connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Exit process if DB fails
  });
