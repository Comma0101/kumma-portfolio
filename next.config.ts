import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/pocket/:path*',
        destination: 'http://127.0.0.1:5000/pocket/:path*',
      },
    ]
  },
};

export default nextConfig;
