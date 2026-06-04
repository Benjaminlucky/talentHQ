// src/app/find-candidates/[id]/page.jsx
// SERVER COMPONENT — generates per-candidate SEO metadata. The Open Graph image
// is set to the candidate's avatar so a shared profile link shows their photo.
// Interactive UI lives in CandidateDetailClient (client component) below.

import {
  SITE_URL,
  SITE_NAME,
  OG_DEFAULT,
  fetchCandidate,
  toMetaDescription,
  absoluteUrl,
} from "@/lib/seo";
import CandidateDetailClient from "./CandidateDetailClient";

export const revalidate = 600;

function locText(loc) {
  if (!loc) return "Nigeria";
  if (typeof loc === "string") return loc;
  return (
    [loc.city, loc.area, loc.country].filter(Boolean).join(", ") || "Nigeria"
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const app = await fetchCandidate(id);

  if (!app) {
    return {
      title: "Candidate not found",
      description: "This candidate profile may no longer be available.",
      robots: { index: false, follow: true },
    };
  }

  const js = app.jobseeker || {};
  const name = js.fullName || "Talent";
  const role = app.roleTitle || js.headline || "Professional";
  const loc = locText(js.location);

  const title = `${name} — ${role} in ${loc}`;
  const description = toMetaDescription(
    js.tagline ||
      app.coverLetter ||
      `${name} is a ${role} based in ${loc}, available for hire on TalentHQ.`,
  );

  const ogImage = absoluteUrl(js.avatar || OG_DEFAULT);
  const canonical = `${SITE_URL}/find-candidates/${id}`;

  return {
    title,
    description,
    keywords: [
      role,
      `${role} ${loc}`,
      `hire ${role}`,
      `${role} Nigeria`,
      `${loc} talent`,
    ].filter(Boolean),
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// JSON-LD Person structured data for richer search understanding.
function CandidateJsonLd({ app, id }) {
  if (!app) return null;
  const js = app.jobseeker || {};
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: js.fullName || "Talent",
    jobTitle: app.roleTitle || js.headline || undefined,
    image: js.avatar ? absoluteUrl(js.avatar) : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: locText(js.location),
      addressCountry: "NG",
    },
    url: `${SITE_URL}/find-candidates/${id}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function CandidateDetailPage({ params }) {
  const { id } = await params;
  const app = await fetchCandidate(id);

  return (
    <>
      <CandidateJsonLd app={app} id={id} />
      <CandidateDetailClient id={id} />
    </>
  );
}
