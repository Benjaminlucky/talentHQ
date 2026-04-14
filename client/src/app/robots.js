// src/app/robots.js
// Next.js automatically serves this as /robots.txt

const SITE_URL = "https://talenthq.buzz";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/findjob/",
          "/find-candidates/",
          "/companies/",
          "/pricing",
          "/reach-us",
          "/signup",
        ],
        disallow: [
          "/dashboard/",
          "/dashboard-admin/",
          "/admin/",
          "/api/",
          "/payment/",
          "/account/",
          "/onboarding/",
        ],
      },
      { userAgent: "GPTBot", disallow: ["/"] },
      { userAgent: "CCBot", disallow: ["/"] },
      { userAgent: "anthropic-ai", disallow: ["/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
