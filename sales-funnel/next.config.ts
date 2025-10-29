import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Explicitly disable Turbopack to use webpack
  webpack: (config, { isServer }) => {
    return config
  },
}

export default nextConfig
