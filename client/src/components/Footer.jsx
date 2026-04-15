"use client";
// src/components/Footer.jsx
import Link from "next/link";

const YEAR = new Date().getFullYear();

const COL = ({ title, links }) => (
  <div>
    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
      {title}
    </p>
    <ul className="space-y-2.5">
      {links.map(({ href, label, external }) => (
        <li key={href}>
          {external ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900 transition"
            >
              {label}
            </a>
          ) : (
            <Link
              href={href}
              className="text-sm text-gray-500 hover:text-gray-900 transition"
            >
              {label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-xl font-black text-gray-900">
              Talent<span className="text-lime-600">HQ</span>
            </Link>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed max-w-xs">
              Nigeria's talent marketplace — connecting employers, jobseekers
              and skilled tradespeople across all 36 states.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-lime-50 border border-lime-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-lime-500 flex-shrink-0" />
              <span className="text-xs text-lime-800 font-semibold">
                NDPA 2023 Compliant
              </span>
            </div>
          </div>

          {/* Platform */}
          <COL
            title="Platform"
            links={[
              { href: "/findjob", label: "Find Jobs" },
              { href: "/find-candidates", label: "Find Candidates" },
              { href: "/companies", label: "Companies" },
              { href: "/postjob", label: "Post a Job" },
              { href: "/post-advert", label: "Post Advert" },
              { href: "/pricing", label: "Pricing" },
            ]}
          />

          {/* Account */}
          <COL
            title="Account"
            links={[
              { href: "/signup", label: "Create Account" },
              { href: "/login", label: "Sign In" },
              { href: "/dashboard/jobseeker", label: "Jobseeker Dashboard" },
              { href: "/dashboard/employer", label: "Employer Dashboard" },
              { href: "/dashboard/handyman", label: "Handyman Dashboard" },
              { href: "/reach-us", label: "Contact Us" },
            ]}
          />

          {/* Legal */}
          <COL
            title="Legal & Privacy"
            links={[
              { href: "/privacy-policy", label: "Privacy Policy" },
              { href: "/terms-of-service", label: "Terms of Service" },
              { href: "/cookie-policy", label: "Cookie Policy" },
              { href: "/data-deletion", label: "Delete My Data" },
              {
                href: "https://ndpc.gov.ng",
                label: "NDPC (Regulator)",
                external: true,
              },
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {YEAR} TalentHQ Nigeria. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 text-center">
            Regulated under the{" "}
            <a
              href="https://ndpc.gov.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-600 hover:underline font-medium"
            >
              Nigeria Data Protection Act 2023
            </a>{" "}
            · Payments by{" "}
            <a
              href="https://paystack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-600 hover:underline font-medium"
            >
              Paystack
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy-policy"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Terms
            </Link>
            <Link
              href="/cookie-policy"
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
