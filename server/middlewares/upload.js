import multer from "multer";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

// ✅ Switch based on environment
let storage;

if (process.env.NODE_ENV === "production") {
  // Cloudinary storage
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "resumes",
      allowed_formats: ["pdf", "doc", "docx"],
      resource_type: "auto", // handles pdf/docs
    },
  });
} else {
  // Local storage (development only)
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/resumes");
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });
}

const upload = multer({ storage });

export default upload;
