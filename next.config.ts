import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'up.wolfey.me',
      },
    ],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
