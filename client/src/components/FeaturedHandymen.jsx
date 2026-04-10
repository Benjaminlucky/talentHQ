"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, MapPin, Star } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE;

export default function FeaturedHandymen() {
  const controls = useAnimation();
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const distanceRef = useRef(0);
  const [handymen, setHandymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch real handymen from API
  useEffect(() => {
    fetch(`${API}/api/handymen?limit=10`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setHandymen(data.handymen || []))
      .catch(() => setHandymen([]))
      .finally(() => setLoading(false));
  }, []);

  // Start marquee once we have data
  useEffect(() => {
    if (handymen.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const start = () => {
      const distance = Math.floor(track.scrollWidth / 2);
      distanceRef.current = distance;
      controls.stop();
      controls.start({
        x: [0, -distance],
        transition: {
          repeat: Infinity,
          duration: Math.max(30, distance / 40),
          ease: "linear",
        },
      });
    };

    const t = setTimeout(start, 120);
    window.addEventListener("resize", start);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", start);
    };
  }, [handymen, controls]);

  const stopLoop = () => controls.stop();
  const startLoop = () => {
    const d = distanceRef.current;
    if (!d) return;
    controls.start({
      x: [0, -d],
      transition: {
        repeat: Infinity,
        duration: Math.max(30, d / 40),
        ease: "linear",
      },
    });
  };

  const SkeletonCard = () => (
    <div className="min-w-[280px] max-w-xs w-full p-5 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 flex-shrink-0 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-800 rounded" />
        </div>
      </div>
      <div className="h-3 w-full bg-gray-700 rounded mb-1.5" />
      <div className="h-3 w-3/4 bg-gray-700 rounded mb-4" />
      <div className="h-8 w-full bg-gray-700 rounded-xl" />
    </div>
  );

  const HandymanCard = ({ hm, idx }) => {
    const initials = (hm.fullName || "H")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const skills = Array.isArray(hm.skills)
      ? hm.skills
      : hm.skills
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.04, duration: 0.4 }}
        onClick={() => router.push(`/handymen/${hm._id}`)}
        className="min-w-[280px] max-w-xs w-full p-5 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 flex-shrink-0 cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:border-amber-500/40 transition-all duration-300 group"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {hm.avatar ? (
            <img
              src={hm.avatar}
              alt={hm.fullName}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-500/40 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white text-sm truncate group-hover:text-amber-300 transition-colors">
              {hm.fullName}
            </h3>
            {hm.trade && (
              <p className="text-amber-400 text-xs font-semibold flex items-center gap-1 mt-0.5">
                <Wrench size={10} />
                {hm.trade}
              </p>
            )}
            {hm.location && (
              <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                <MapPin size={9} />
                {hm.location}
              </p>
            )}
          </div>
          {hm.avgRating > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">
                {hm.avgRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Bio */}
        {hm.bio && (
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">
            {hm.bio}
          </p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skills.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/20 font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
          {hm.yearsExperience > 0 && (
            <span className="text-xs text-gray-500">
              {hm.yearsExperience}yr exp
            </span>
          )}
          <span className="text-xs font-bold text-lime-400 group-hover:text-lime-300 transition-colors ml-auto flex items-center gap-1">
            View Profile →
          </span>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="mt-16 overflow-hidden">
        <h2 className="text-4xl font-extrabold text-center text-gray-300 my-12">
          Featured Handymen
        </h2>
        <div className="flex gap-5 px-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (handymen.length === 0) return null;

  return (
    <div className="mt-16 overflow-hidden">
      <h2 className="text-4xl font-extrabold text-center text-gray-300 my-12">
        Featured Handymen
      </h2>

      <div ref={containerRef} className="relative w-full overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex gap-5 px-4 md:px-0 w-max"
          animate={controls}
          onMouseEnter={stopLoop}
          onMouseLeave={startLoop}
          onTouchStart={stopLoop}
          onTouchEnd={startLoop}
          style={{ willChange: "transform" }}
        >
          {[...handymen, ...handymen].map((hm, idx) => (
            <HandymanCard
              key={`${hm._id}-${idx}`}
              hm={hm}
              idx={idx % handymen.length}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
