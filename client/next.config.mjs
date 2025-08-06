/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false, // ✅ Required for static export mode when using base64 images
  },
};

export default nextConfig;
