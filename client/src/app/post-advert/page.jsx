import Link from "next/link";
import { Megaphone, ChevronRight, BarChart3, Target, Eye } from "lucide-react";

export default function PostAdvertPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Megaphone size={28} className="text-white" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 mb-4">
          Coming Soon
        </span>

        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Advertise on TalentHQ
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto mb-10 leading-relaxed">
          Self-serve ad placements are in development. Get in front of thousands
          of Nigerian job seekers, employers, and skilled workers every day.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: Eye,
              title: "High Visibility",
              desc: "Ads displayed on high-traffic job listing pages.",
            },
            {
              icon: Target,
              title: "Targeted Reach",
              desc: "Filter by role type, location, and industry.",
            },
            {
              icon: BarChart3,
              title: "Performance Tracking",
              desc: "Real-time impressions and click reporting.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-left"
            >
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                <Icon size={16} className="text-amber-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <p className="font-bold text-gray-900 mb-1">
            Interested in advertising?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Reach out to our team and we'll set up a custom placement for you.
          </p>
          <Link
            href="/reach-us"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Contact Advertising Team
            <ChevronRight size={15} />
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Looking to post a job?{" "}
          <Link href="/postjob" className="text-lime-700 underline">
            Post a job instead →
          </Link>
        </p>
      </div>
    </div>
  );
}
