// src/app/sitemap.js
// Next.js automatically serves this as /sitemap.xml

const SITE_URL = "https://talenthq.buzz";
const API =
  process.env.NEXT_PUBLIC_API_BASE || "https://talenthq-vl3n.onrender.com";

export default async function sitemap() {
  // ── Static routes ─────────────────────────────────────────────────────────
  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/findjob`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/find-candidates`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/companies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/post-advert`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/reach-us`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // ── Dynamic job routes ────────────────────────────────────────────────────
  let jobRoutes = [];
  try {
    const res = await fetch(`${API}/api/jobs?limit=500&page=1`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await res.json();
    const jobs = data.jobs || [];
    jobRoutes = jobs.map((job) => ({
      url: `${SITE_URL}/findjob/${job._id}`,
      lastModified: job.updatedAt ? new Date(job.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // Silently fail — static routes still served
  }

  return [...staticRoutes, ...jobRoutes];
}
