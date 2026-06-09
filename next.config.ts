import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow SVG images from our own tool-image API route
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Vercel Blob (for user-uploaded photos)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
