import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    deviceSizes: [640, 960, 1280, 1920],
    imageSizes: [48, 64, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "up.wolfey.me",
        pathname: "/*",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
};

export default nextConfig;
