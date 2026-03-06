import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'up.wolfey.me',
        pathname: '/*',
      },
    ],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
