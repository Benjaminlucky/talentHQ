// src/app/findjob/metadata.js
// Import and re-export from your findjob/page.jsx
// OR paste the export directly into findjob/page.jsx

export const metadata = {
  title: "Find Jobs in Nigeria",
  description:
    "Browse thousands of professional and trade jobs across Nigeria. Filter by location, category and job type. Apply directly on TalentHQ.",
  openGraph: {
    title: "Find Jobs in Nigeria | TalentHQ",
    description:
      "Browse thousands of professional and trade jobs across Nigeria. Filter by location, category and job type.",
    url: "https://talenthq.buzz/findjob",
    images: [
      { url: "https://talenthq.buzz/og-findjob.png", width: 1200, height: 630 },
    ],
  },
  alternates: { canonical: "https://talenthq.buzz/findjob" },
};
