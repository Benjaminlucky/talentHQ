import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

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
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
