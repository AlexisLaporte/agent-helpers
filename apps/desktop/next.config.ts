import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@agent-helpers/ui', '@agent-helpers/core', '@agent-helpers/library'],
  output: 'standalone',
  distDir: '.next',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    skipTrailingSlashRedirect: true,
  },
  turbopack: {},
  webpack: (config, { isServer, dev }) => {
    // Ignore dev logs and other files that change frequently
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/!(@agent-helpers)/**',
          '**/.git/**',
          '**/dev/**',
          '**/.next/**',
        ],
      };
    }

    // Force watching package files in dev mode
    if (dev) {
      config.snapshot = {
        ...config.snapshot,
        managedPaths: [],
      };
    }

    return config;
  },
};

export default nextConfig;
