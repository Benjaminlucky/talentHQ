// app/findjob/page.js
import { Suspense } from "react";
import FindJobsClient from "./FindJobsClient";
import { SITE_URL, SITE_NAME, OG_DEFAULT, toMetaDescription } from "@/lib/seo";

// ── Dynamic, filter-aware SEO metadata ──────────────────────────────────────
// Builds titles like "Graphic Designer Jobs in Lagos | TalentHQ" from the
// ?search= and ?location= query params, so searches that map to a filtered
// listing can rank and land here. Falls back to a generic jobs title.
export async function generateMetadata({ searchParams }) {
  const sp = (await searchParams) || {};
  const search = (sp.search || "").toString().trim();
  const location = (sp.location || sp.jobType || "").toString().trim();
  const category = (sp.category || "").toString().trim();

  const subject = search || category || "Jobs";
  const where = location ? ` in ${location}` : " in Nigeria";

  const title = search
    ? `${search} Jobs${where}`
    : category
      ? `${category} Jobs${where}`
      : `Browse Jobs${where}`;

  const description = toMetaDescription(
    `Find ${search || category || "the latest"} jobs${where} on TalentHQ. ` +
      `Browse openings from verified employers and apply in one click.`,
  );

  // Index listing pages that carry a real query intent (a search term or a
  // category) — these are the pages we WANT to rank, e.g. "graphic designer
  // jobs in lagos". Plain pagination/sort-only variants stay out of the index
  // to avoid thin, duplicate pages. Filtered pages canonicalise to themselves
  // so Google treats each meaningful query as its own landing page.
  const hasQueryIntent = Boolean(search || category);
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (location) params.set("location", location);
  const qs = params.toString();
  const canonical = `${SITE_URL}/findjob${qs ? `?${qs}` : ""}`;

  return {
    title,
    description,
    keywords: [
      subject,
      `${subject} ${location || "Nigeria"}`,
      `${subject} jobs`,
      `jobs ${location || "Nigeria"}`,
      "Nigeria jobs",
    ].filter(Boolean),
    alternates: { canonical },
    robots: { index: hasQueryIntent || !qs, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: OG_DEFAULT, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_DEFAULT],
    },
  };
}

// Skeleton shown during SSR / before client hydrates
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 h-[72px]" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-200" />
                  <div>
                    <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-100 rounded-full" />
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FindJobsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FindJobsClient />
    </Suspense>
  );
}
