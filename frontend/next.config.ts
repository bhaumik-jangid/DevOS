import type { NextConfig } from "next"

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "https://your-backend.onrender.com"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${BACKEND_URL}/media/:path*`,
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/media/**" },
      { protocol: "http", hostname: "backend", pathname: "/media/**" },
      { protocol: "https", hostname: "*.onrender.com", pathname: "/media/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
}

export default nextConfig
