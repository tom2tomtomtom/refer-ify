import type { NextConfig } from "next";

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
  outputFileTracingRoot: '/Users/thomasdowuona-hyde/refer-ify',
};

export default nextConfig;
