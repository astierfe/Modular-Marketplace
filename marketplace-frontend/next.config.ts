// next.config.ts - Bundle Optimization
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Tree-shaking optimization for Web3 libraries
  experimental: {
    optimizePackageImports: [
      '@rainbow-me/rainbowkit',
      'wagmi',
      'viem',
      '@tanstack/react-query',
    ],
  },

  // ✅ Remove console in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ✅ Image optimization for IPFS
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
      },
    ],
  },
};

export default nextConfig;