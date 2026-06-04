// src/app/find-candidates/page.jsx
// SERVER COMPONENT — generates filter-aware SEO metadata for the talent
// directory so searches like "hire graphic designer lagos" can land here.
// The interactive UI lives in FindCandidatesClient (client component).
import { Suspense } from "react";
import FindCandidatesClient from "./FindCandidatesClient";
import { SITE_URL, SITE_NAME, OG_DEFAULT, toMetaDescription } from "@/lib/seo";

export async function generateMetadata({ searchParams }) {
  const sp = (await searchParams) || {};
  const search = (sp.search || sp.q || "").toString().trim();
  const location = (sp.location || "").toString().trim();
  const role = (sp.role || sp.trade || "").toString().trim();

  const subject = search || role || "Talent";
  const where = location ? ` in ${location}` : " in Nigeria";

  const title = search
    ? `Hire ${search}${where}`
    : role
      ? `Hire ${role}s${where}`
      : `Browse Talent${where}`;

  const description = toMetaDescription(
    `Find and hire ${search || role || "skilled professionals and tradespeople"}${where} on TalentHQ. ` +
      `Browse verified candidates and reach out directly.`,
  );

  const hasQueryIntent = Boolean(search || role);
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (location) params.set("location", location);
  const qs = params.toString();
  const canonical = `${SITE_URL}/find-candidates${qs ? `?${qs}` : ""}`;

  return {
    title,
    description,
    keywords: [
      subject,
      `hire ${subject}`,
      `${subject} ${location || "Nigeria"}`,
      `${subject} for hire`,
      `${location || "Nigeria"} talent`,
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-100 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FindCandidatesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FindCandidatesClient />
    </Suspense>
  );
}
