/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Optimized bundling
    optimizePackageImports: [
      '@heroicons/react',
      'next-themes',
      'framer-motion'
    ]
  },
  
  // Turbopack settings
  turbopack: {
    root: '/Users/em/web/trader-ai-agent'
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600, // 1 hour
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [], // Add allowed domains if needed
  },

  // Compression
  compress: true,

  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        heroicons: {
          test: /[\\/]node_modules[\\/]@heroicons[\\/]/,
          name: 'heroicons',
          chunks: 'all',
          priority: 20
        },
        common: {
          minChunks: 2,
          chunks: 'all',
          name: 'common',
          priority: 5
        }
      }
    };

    // Tree shaking optimization
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    // Bundle analyzer in development
    if (dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      if (process.env.ANALYZE === 'true') {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8888,
            openAnalyzer: true
          })
        );
      }
    }

    return config;
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Build output
  output: 'standalone',
  
  // Performance optimizations are now enabled by default in Next.js 15
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Power pack settings for better performance
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Transpile packages for better compatibility
  transpilePackages: [
    '@heroicons/react'
  ],

  // Production source maps for debugging (optional)
  productionBrowserSourceMaps: false,

  // ESLint configuration - DISABLED for build
  eslint: {
    // Skip ESLint during builds
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration - DISABLED for build
  typescript: {
    // Skip TypeScript type checking during builds
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;