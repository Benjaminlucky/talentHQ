import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Zap,
  Users,
  Globe,
} from "lucide-react";

export default function PostJobPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Briefcase size={28} className="text-white" />
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-4">Post a Job</h1>
        <p className="text-gray-500 text-base max-w-md mx-auto mb-10 leading-relaxed">
          Reach thousands of qualified candidates across Nigeria. Create your
          employer account to start posting jobs in minutes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: Zap,
              title: "Quick Setup",
              desc: "Post your first job in under 5 minutes.",
            },
            {
              icon: Users,
              title: "Qualified Candidates",
              desc: "Reach pre-screened professionals and tradespeople.",
            },
            {
              icon: Globe,
              title: "Nigeria-Wide",
              desc: "Access talent across all 36 states.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-left"
            >
              <div className="w-9 h-9 bg-lime-50 rounded-xl flex items-center justify-center mb-3">
                <Icon size={16} className="text-lime-600" />
              </div>
              <p className="font-bold text-gray-900 text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Create Employer Account
            <ChevronRight size={15} />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Log in to Post
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Already an employer?{" "}
          <Link href="/login" className="text-lime-700 underline">
            Log in to your dashboard →
          </Link>
        </p>
      </div>
    </div>
  );
}
