import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../..'),
  distDir: '.next',
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

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dkl8kiemy/**',
      },
    ],
  },
  
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
      // Removed /login redirect - page exists at (auth)/login/page.tsx
    ];
  },
};

export default nextConfig;
