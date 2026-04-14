// src/app/layout.js
// NOTE: This is a SERVER component — "use client" is intentionally removed.
// The Navbar and Providers that need client state are imported inside a
// client wrapper (LayoutWrapper) defined in layout-client.jsx

import { Inter } from "next/font/google";
import "./globals.css";
import LayoutClient from "./layout-client";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE_URL = "https://talenthq.buzz";
const SITE_NAME = "TalentHQ";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TalentHQ — Nigeria's Talent Marketplace",
    template: "%s | TalentHQ",
  },
  description:
    "Find jobs, hire skilled professionals and tradespeople across Nigeria. TalentHQ connects employers, jobseekers and handymen.",
  keywords: [
    "Nigeria jobs",
    "Nigerian job board",
    "hire in Nigeria",
    "Lagos jobs",
    "Abuja jobs",
    "find work Nigeria",
    "handyman Nigeria",
    "skilled trades Nigeria",
    "employment Nigeria",
  ],
  authors: [{ name: "TalentHQ", url: SITE_URL }],
  creator: "TalentHQ",
  publisher: "TalentHQ",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "TalentHQ — Nigeria's Talent Marketplace",
    description:
      "Find jobs, hire skilled professionals and tradespeople across Nigeria.",
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "TalentHQ — Nigeria's Talent Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@talenthq_ng",
    creator: "@talenthq_ng",
    title: "TalentHQ — Nigeria's Talent Marketplace",
    description:
      "Find jobs, hire skilled professionals and tradespeople across Nigeria.",
    images: [`${SITE_URL}/og-default.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
