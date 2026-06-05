// server/utils/cloudinaryUrl.js
// Helpers for serving Cloudinary "raw" document URLs as proper downloads.

// Turn a Cloudinary raw URL into a forced-download URL with a friendly filename.
// Cloudinary's fl_attachment flag makes the browser download the file (with the
// given name + its real extension) instead of opening it inline or saving it
// without an extension.
//
// Input : https://res.cloudinary.com/<cloud>/raw/upload/v123/talenthq/resumes/cv_123.pdf
// Output: https://res.cloudinary.com/<cloud>/raw/upload/fl_attachment:Resume/v123/talenthq/resumes/cv_123.pdf
export function toDownloadUrl(url, downloadName = "Resume") {
  if (!url || typeof url !== "string") return url;
  // Only transform Cloudinary delivery URLs that contain "/upload/".
  if (!/res\.cloudinary\.com/.test(url) || !url.includes("/upload/")) {
    return url;
  }
  // Avoid double-inserting if already present.
  if (url.includes("/upload/fl_attachment")) return url;

  const safeName =
    String(downloadName)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60) || "Resume";

  return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
}
