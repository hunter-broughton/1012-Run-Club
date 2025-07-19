import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export settings for Vercel deployment
  images: {
    domains: [], // Add any external image domains you need
  },
};

export default nextConfig;
