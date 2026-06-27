import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

// Extract hostname and port from backendUrl (for images config)
const backendHost = new URL(backendUrl).hostname;
const backendPort = new URL(backendUrl).port || "4000";

const nextConfig: NextConfig = {
  // Existing rewrites – keep them
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/api/health",
        destination: `${backendUrl}/`,
      },
      {
        source: "/public/:path*",
        destination: `${backendUrl}/public/:path*`,
      },
    ];
  },

  // ADD THIS: Allow images from your backend
  images: {
    remotePatterns: [
      {
        protocol: new URL(backendUrl).protocol.slice(0, -1), // "http" or "https"
        hostname: backendHost,
        port: backendPort,
        pathname: "/public/profile/**", // adjust if your images are elsewhere
      },
      // If you ever use localhost or 127.0.0.1 explicitly
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/public/profile/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/public/profile/**",
      },
    ],
  },
};

export default nextConfig;