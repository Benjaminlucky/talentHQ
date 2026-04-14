// src/app/findjob/[id]/page-metadata.js
// Add this generateMetadata export to your findjob/[id]/page.jsx
// (Next.js requires generateMetadata to be in the same file as the page
//  OR in a separate layout.js for that segment)
//
// Paste this function into the TOP of findjob/[id]/page.jsx before the default export:

const API =
  process.env.NEXT_PUBLIC_API_BASE || "https://talenthq-vl3n.onrender.com";
const SITE_URL = "https://talenthq.buzz";

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(`${API}/api/jobs/${params.id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) return {};
    const job = await res.json();

    const title = `${job.title} at ${job.company?.companyName || "TalentHQ"}`;
    const description = `${job.type} · ${job.location} · ${job.salary ? `₦${job.salary}` : "Salary TBC"}. ${(job.description || "").slice(0, 120)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/findjob/${params.id}`,
        type: "article",
        images: [
          job.company?.logo
            ? {
                url: job.company.logo,
                width: 400,
                height: 400,
                alt: job.company.companyName,
              }
            : { url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 },
        ],
      },
      twitter: { card: "summary", title, description },
      alternates: { canonical: `${SITE_URL}/findjob/${params.id}` },
    };
  } catch {
    return { title: "Job Details | TalentHQ" };
  }
}

// ── JSON-LD structured data helper ────────────────────────────────────────────
// Drop <script type="application/ld+json"> into the job detail page JSX:
export function jobStructuredData(job) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || "",
    datePosted: job.createdAt,
    validThrough: job.deadline || undefined,
    employmentType: job.type?.toUpperCase().replace("-", "_") || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company?.companyName || "TalentHQ Employer",
      sameAs: job.company?.companyWebsite || "https://talenthq.buzz",
      logo: job.company?.logo || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "",
        addressRegion: job.state || "",
        addressCountry: "NG",
      },
    },
    baseSalary: job.salary
      ? {
          "@type": "MonetaryAmount",
          currency: "NGN",
          value: {
            "@type": "QuantitativeValue",
            value: job.salary,
            unitText: "MONTH",
          },
        }
      : undefined,
  };
}
