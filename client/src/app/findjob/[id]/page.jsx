// src/app/findjob/[id]/page.jsx
// SERVER COMPONENT — generates per-job SEO metadata (title, description, and an
// Open Graph image set to the employer's logo) so each job ranks on search
// engines and shows a rich preview when its link is shared. The interactive UI
// lives in JobDetailClient (a client component) rendered below.

import {
  SITE_URL,
  SITE_NAME,
  OG_DEFAULT,
  fetchJob,
  toMetaDescription,
  absoluteUrl,
} from "@/lib/seo";
import JobDetailClient from "./JobDetailClient";

// Regenerate metadata/page at most every 10 minutes (ISR).
export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const job = await fetchJob(id);

  if (!job) {
    return {
      title: "Job not found",
      description: "This job posting may have been filled or removed.",
      robots: { index: false, follow: true },
    };
  }

  const company =
    job.company?.companyName || job.company?.fullName || "a company";
  const loc = job.location || "Nigeria";
  const typeLabel = job.type ? ` (${job.type})` : "";

  const title = `${job.title} at ${company} — ${loc}`;
  const description = toMetaDescription(
    job.description ||
      `${job.title}${typeLabel} role at ${company} in ${loc}. Apply now on TalentHQ.`,
  );

  const ogImage = absoluteUrl(job.company?.logo || OG_DEFAULT);
  const canonical = `${SITE_URL}/findjob/${id}`;

  return {
    title,
    description,
    keywords: [
      job.title,
      `${job.title} ${loc}`,
      `${job.title} jobs`,
      `${job.category || job.title} Nigeria`,
      `jobs at ${company}`,
      `${loc} jobs`,
    ].filter(Boolean),
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${company} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// JSON-LD JobPosting structured data → enables Google Jobs rich results.
function JobJsonLd({ job, id }) {
  if (!job) return null;
  const company =
    job.company?.companyName || job.company?.fullName || "TalentHQ Employer";

  const data = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || job.title,
    datePosted: job.createdAt || undefined,
    employmentType: (job.type || "").toUpperCase().replace(/[\s-]/g, "_"),
    hiringOrganization: {
      "@type": "Organization",
      name: company,
      logo: job.company?.logo ? absoluteUrl(job.company.logo) : undefined,
      sameAs: job.company?.companyWebsite || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Nigeria",
        addressCountry: "NG",
      },
    },
    url: `${SITE_URL}/findjob/${id}`,
  };

  if (job.salary) {
    data.baseSalary = {
      "@type": "MonetaryValue",
      currency: "NGN",
      value: { "@type": "QuantitativeValue", value: job.salary },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const job = await fetchJob(id);

  return (
    <>
      <JobJsonLd job={job} id={id} />
      <JobDetailClient id={id} />
    </>
  );
}
