import type { NextConfig } from "next"

import { normalizeBackendUrl } from "./lib/backend-url"

const backendUrl =
  normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL) || "http://localhost:8000"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
