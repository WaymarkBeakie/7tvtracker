import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@emotetracker/db"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.7tv.app",
      },
    ],
  },
};

export default nextConfig;