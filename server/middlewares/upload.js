// server/middlewares/upload.js
// Two Cloudinary storage instances routed by field name:
//   resume          → folder talenthq/resumes  (resource_type "auto": pdf/doc/docx)
//   avatar | logo   → folder talenthq/avatars  (resource_type "image": jpg/png/webp)
//
// IMPORTANT: we deliberately do NOT pass Cloudinary `allowed_formats`. That
// option makes Cloudinary guess the format from the streamed bytes and reject
// anything it can't cleanly identify — which is why valid uploads were failing
// with "Image file format ai not allowed". Format validation is done up-front
// in multer's fileFilter (by extension + MIME) where we fully control it.

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
    // "auto" lets Cloudinary store PDFs and Office docs reliably without
    // mis-detecting the format. (raw also works but auto is more forgiving.)
    resource_type: "auto",
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
    transformation: [
      { width: 500, height: 500, crop: "fill", quality: "auto:good" },
    ],
  },
});

// ── Local disk storage (development only) ─────────────────────────────────────
const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isImage = ["avatar", "logo"].includes(file.fieldname);
    cb(null, isImage ? "uploads/avatars" : "uploads/resumes");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

// ── Smart combined storage (production) ───────────────────────────────────────
const smartCloudStorage = {
  _handleFile(req, file, cb) {
    const isImage = ["avatar", "logo"].includes(file.fieldname);
    const storage = isImage ? imageCloudStorage : resumeCloudStorage;
    storage._handleFile(req, file, cb);
  },
  _removeFile(req, file, cb) {
    cb(null);
  },
};

// ── Allowed types ─────────────────────────────────────────────────────────────
const IMAGE_EXT = /^(jpe?g|png|webp)$/i;
const IMAGE_MIME = /^image\/(jpe?g|png|webp)$/i;
const DOC_EXT = /^(pdf|docx?)$/i;
const DOC_MIME =
  /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/octet-stream)$/i;

// ── Multer instance ───────────────────────────────────────────────────────────
const upload = multer({
  storage: IS_PROD ? smartCloudStorage : localDiskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).replace(".", "").toLowerCase();
    const isImageField = ["avatar", "logo"].includes(file.fieldname);
    const isResumeField = file.fieldname === "resume";

    if (isImageField) {
      // Accept if EITHER extension OR mimetype says it's a valid image.
      if (IMAGE_EXT.test(ext) || IMAGE_MIME.test(file.mimetype)) {
        return cb(null, true);
      }
      return cb(
        new Error("Profile photo / logo must be a JPG, PNG or WEBP image"),
      );
    }

    if (isResumeField) {
      // Accept if EITHER extension OR mimetype says it's a doc.
      // (octet-stream is allowed only when the extension is a known doc type,
      //  because some browsers send DOCX as octet-stream.)
      const mimeOk =
        DOC_MIME.test(file.mimetype) &&
        (file.mimetype !== "application/octet-stream" || DOC_EXT.test(ext));
      if (DOC_EXT.test(ext) || mimeOk) {
        return cb(null, true);
      }
      return cb(new Error("Resume must be a PDF, DOC or DOCX file"));
    }

    // Unknown field — reject rather than silently store.
    return cb(new Error(`Unexpected file field: ${file.fieldname}`));
  },
});

// ── Error-handling wrapper ────────────────────────────────────────────────────
// Wrap upload.fields(...) so a rejected file (wrong type, too large, or a
// Cloudinary error) returns a clean 400 JSON response instead of bubbling up as
// an "Unhandled error" that silently fails the request. Use this in routes via
// uploadFields([{ name: "resume" }, ...]).
export function uploadFields(fields) {
  const handler = upload.fields(fields);
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err) {
        console.error("⚠️ Upload error:", err.message);
        const status = err instanceof multer.MulterError ? 400 : 400;
        return res.status(status).json({
          message: err.message || "File upload failed",
          code: err.code || "UPLOAD_ERROR",
        });
      }
      next();
    });
  };
}

export default upload;
