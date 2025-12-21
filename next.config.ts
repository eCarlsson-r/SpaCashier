import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost', // The hostname of your external images
        port: '8000',
        pathname: '/storage/**', // A glob pattern for the path
      },
    ],
  },
};

export default nextConfig;
