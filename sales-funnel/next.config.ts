import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Empty turbopack config to silence the warning
  turbopack: {},
}

export default nextConfig
