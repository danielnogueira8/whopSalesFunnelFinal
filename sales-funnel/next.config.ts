import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  env: {
    // Automatically set NEXT_PUBLIC_VERCEL_URL from VERCEL_URL if not already set
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || 
      (process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000'),
  },
}

export default nextConfig
