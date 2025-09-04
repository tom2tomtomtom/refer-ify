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
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  // Move serverComponentsExternalPackages to top-level as serverExternalPackages
  serverExternalPackages: ['@supabase/supabase-js'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // Server configuration for better error handling
  serverRuntimeConfig: {
    // Reduce server timeout
    maxDuration: 15,
  },
  
  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects for better SEO and error handling
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
