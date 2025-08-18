import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Do not block builds on lint errors (we still show them during dev/CI)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
