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
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Ignore dev logs and other files that change frequently
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dev/**',
          '**/.next/**',
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
