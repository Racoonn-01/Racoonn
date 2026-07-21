import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.3', '192.168.1.4', '192.168.1.5', '192.168.1.6', '192.168.1.2'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'sgp.cloud.appwrite.io',
      },
    ],
  },
};

export default nextConfig;
