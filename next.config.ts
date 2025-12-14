import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // ImageKit CDN configuration
  // Disable Vercel image optimization - using ImageKit instead
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: '*.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS for external images
      },
      {
        protocol: 'http',
        hostname: '**', // Allow HTTP for local development
      },
    ],
    // Disable Next.js image optimization - ImageKit handles optimization
    unoptimized: true,
    // Keep formats for fallback
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year - ImageKit handles caching
  },
  
  // Enable compression
  compress: true,
  
  // Code splitting and optimization
  experimental: {
    optimizePackageImports: ['lucide-react', '@headlessui/react'],
  },
  
  // Output configuration
  output: 'standalone',
  
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3501/api',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
