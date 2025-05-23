import "./globals.css";

import Navbar from "@/components/Navbar";

export const metadata = {
  title: {
    default: "TalentHQ",
    template: "%s | TalentHQ",
  },
  description: "Find jobs, Hire Candidates, and Post Jobs",
  keywords: [
    "job board",
    "job listings",
    "job search",
    "job opportunities",
    "job vacancies",
    "job postings",
    "job applications",
    "job seekers",
    "employers",
    "recruitment",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
