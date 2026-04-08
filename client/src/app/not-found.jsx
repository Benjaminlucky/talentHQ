import Link from "next/link";
import { Home, Briefcase, Users, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[120px] sm:text-[160px] font-black text-gray-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">T</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-3">
          This page doesn't exist
        </h1>
        <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
          The page you're looking for may have been moved, deleted, or never
          existed. Try one of these instead:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { href: "/", icon: Home, label: "Home", desc: "Back to start" },
            {
              href: "/findjob",
              icon: Briefcase,
              label: "Find Jobs",
              desc: "Browse openings",
            },
            {
              href: "/find-candidates",
              icon: Users,
              label: "Find Talent",
              desc: "Browse profiles",
            },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-lime-200 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 bg-gray-50 group-hover:bg-lime-50 rounded-xl flex items-center justify-center transition-colors">
                <Icon
                  size={18}
                  className="text-gray-500 group-hover:text-lime-600 transition-colors"
                />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-lime-700 font-semibold hover:text-lime-800"
        >
          <Home size={14} />
          Go to homepage
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
