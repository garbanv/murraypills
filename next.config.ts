import type { NextConfig } from "next"
import withPWA from "next-pwa"

const nextConfig: NextConfig = withPWA({
  dest: "public", // Output directory for service worker and assets
  disable: process.env.NODE_ENV === "development", // Disable PWA in development
})({
  experimental: {
    turbo: false, // Disable Turbopack
  },
})

export default nextConfig
