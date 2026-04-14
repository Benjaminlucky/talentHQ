// next.config.mjs
/** @type {import('next').Config} */
const nextConfig = {
  // ── Image optimisation ────────────────────────────────────────────────────
  images: {
    // Allow external image domains used on the platform
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" }, // DiceBear avatars
      { protocol: "https", hostname: "ui-avatars.com" }, // UI Avatars
      { protocol: "https", hostname: "**.cloudinary.com" }, // Future: Cloudinary CDN
      { protocol: "https", hostname: "talenthq.buzz" },
    ],
    // Serve modern formats: WebP / AVIF where browser supports
    formats: ["image/avif", "image/webp"],
    // Keep device sizes sane — avoids generating enormous images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimised images for 7 days on CDN
    minimumCacheTTL: 604800,
  },

  // ── Compression ───────────────────────────────────────────────────────────
  compress: true,

  // ── HTTP security & caching headers ──────────────────────────────────────
  async headers() {
    return [
      // Security headers on all routes
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // Long-lived cache for Next.js static chunks (they're fingerprinted)
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache public images for 7 days
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      // No-cache on API routes (handled by backend)
      {
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },

  // ── Bundle optimisation ───────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
};

export default nextConfig;
