import Link from "next/link";

const footerLinks = [
  { href: "/findjob", label: "Find Jobs" },
  { href: "/find-candidates", label: "Find Talent" },
  { href: "/postjob", label: "Post a Job" },
  { href: "/reach-us", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="w-screen bg-gray-900 text-gray-400 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 sm:px-10 lg:px-16">
        <span className="text-white font-black text-lg">
          Talent<span className="text-lime-500">HQ</span>
        </span>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-600">© 2026 TalentHQ Nigeria</p>
      </div>
    </footer>
  );
}
