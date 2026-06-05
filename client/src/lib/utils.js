import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Turn a Cloudinary raw resume URL into a forced-download URL with a friendly
// filename + its real extension. Mirrors the server-side helper. Cloudinary's
// fl_attachment flag makes the browser download the file (named, with its
// extension) instead of opening it inline or saving it without an extension.
export function resumeDownloadUrl(url, downloadName = "Resume") {
  if (!url || typeof url !== "string") return url;
  if (!/res\.cloudinary\.com/.test(url) || !url.includes("/upload/"))
    return url;
  if (url.includes("/upload/fl_attachment")) return url;
  const safeName =
    String(downloadName)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60) || "Resume";
  return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
}
