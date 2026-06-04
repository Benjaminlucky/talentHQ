// src/lib/seo.js
// Server-side SEO helpers shared by the dynamic job and candidate pages.
// These run in server components (generateMetadata), so they fetch directly
// from the API and never touch the browser.

export const SITE_URL = "https://talenthq.buzz";
export const SITE_NAME = "TalentHQ";
const API =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://talenthq-production.up.railway.app";

// Default share image when an entity has no logo/avatar.
export const OG_DEFAULT = `${SITE_URL}/og-default.png`;

// Strip HTML tags and collapse whitespace, then clamp to a max length for
// meta descriptions (Google shows ~155–160 chars).
export function toMetaDescription(text, max = 160) {
  if (!text) return "";
  const clean = String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

// Make any image URL absolute (OG images must be absolute URLs).
export function absoluteUrl(url) {
  if (!url) return OG_DEFAULT;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ── Data fetchers (server-side, cached + resilient) ──────────────────────────
// A short timeout means a slow/cold backend never hangs the page render;
// we fall back to generic metadata instead of crashing.
async function safeFetch(path, revalidate = 600) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API}${path}`, {
      signal: controller.signal,
      next: { revalidate },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchJob(id) {
  const data = await safeFetch(`/api/jobs/${id}`);
  // getJobById returns the job object directly
  return data && (data.job || data._id ? data : null);
}

export async function fetchCandidate(id) {
  const data = await safeFetch(`/api/profile/applications/${id}`);
  // getApplicationById returns the shaped application directly
  return data && (data._id ? data : null);
}
