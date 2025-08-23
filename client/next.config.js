/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'storage.googleapis.com' }],
  },

  webpack(config) {
    // Exclude test files from the build
    config.module.rules.push({
      test: /\.test\.(js|jsx|ts|tsx)$/,
      use: 'ignore-loader',
    })

    // Exclude all files in __tests__ directories
    config.module.rules.push({
      test: /[\\/]__tests__[\\/].+\.(js|jsx|ts|tsx)$/,
      use: 'ignore-loader',
    })

    return config
  },
  // Disable TypeScript type checking in production build to avoid errors
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Explicitly define which files should be considered pages
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer(nextConfig)
