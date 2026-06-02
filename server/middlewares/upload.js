// server/middlewares/upload.js
// Fixed version — two separate Cloudinary storage instances:
//   resumeStorage  → folder talenthq/resumes, raw resource, pdf/doc/docx only
//   imageStorage   → folder talenthq/avatars, image resource, jpg/png/webp only
// A smart combined storage routes each uploaded field to the correct instance
// so upload.fields([{name:"resume"},{name:"avatar"},{name:"logo"}]) works in
// a single middleware call without rejecting image files.

import multer from "multer";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const IS_PROD = process.env.NODE_ENV === "production";

// ── Cloudinary: resume / document storage ─────────────────────────────────────
const resumeCloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "talenthq/resumes",
    resource_type: "raw", // required for PDF/DOC files
    allowed_formats: ["pdf", "doc", "docx"],
    use_filename: true,
    unique_filename: true,
  },
});

// ── Cloudinary: image storage (avatars + logos) ───────────────────────────────
const imageCloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "talenthq/avatars",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 500, height: 500, crop: "fill", quality: "auto:good" },
    ],
  },
});

// ── Local disk storage (development only) ─────────────────────────────────────
const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use separate local folders to mirror production Cloudinary folders
    const isImage = ["avatar", "logo"].includes(file.fieldname);
    const dir = isImage ? "uploads/avatars" : "uploads/resumes";
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

// ── Smart combined storage (production) ───────────────────────────────────────
// Routes each file to the correct Cloudinary storage based on field name.
// "resume"            → resumeCloudStorage  (raw, pdf/doc/docx)
// "avatar" | "logo"   → imageCloudStorage   (image, jpg/png/webp)
const smartCloudStorage = {
  _handleFile(req, file, cb) {
    const isImage = ["avatar", "logo"].includes(file.fieldname);
    const storage = isImage ? imageCloudStorage : resumeCloudStorage;
    storage._handleFile(req, file, cb);
  },
  _removeFile(req, file, cb) {
    // Cloudinary files are removed via the API, not the filesystem
    cb(null);
  },
};

// ── Multer instance ───────────────────────────────────────────────────────────
const upload = multer({
  storage: IS_PROD ? smartCloudStorage : localDiskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB global cap
  },
  fileFilter(req, file, cb) {
    const isImage = ["avatar", "logo"].includes(file.fieldname);
    const isResume = file.fieldname === "resume";

    if (isImage) {
      const allowed = /jpeg|jpg|png|webp/i;
      const ext = path.extname(file.originalname).replace(".", "");
      if (!allowed.test(ext)) {
        return cb(new Error("Avatar/logo must be JPG, PNG or WEBP"));
      }
    }

    if (isResume) {
      const allowed = /pdf|doc|docx/i;
      const ext = path.extname(file.originalname).replace(".", "");
      if (!allowed.test(ext)) {
        return cb(new Error("Resume must be PDF, DOC or DOCX"));
      }
    }

    cb(null, true);
  },
});

export default upload;
