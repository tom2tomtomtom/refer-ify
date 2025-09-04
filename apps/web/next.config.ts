import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'recharts'],
  },
  outputFileTracingRoot: path.join(__dirname, '../..'),
};

export default nextConfig;
