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
      }
    ],
  },
};

const url = (process.env.NEXT_PUBLIC_API_URL ?? "").split(":");
if (url.length > 1) {
    const currentHost = (url.length > 2) ? {
    protocol: url[0],
    hostname: url[1].replace("//", ""),
    port: url[2],
    pathname: '/storage/**', // A glob pattern for the path
  } : {
    protocol: url[0],
    hostname: url[1].replace("//", ""),
    pathname: '/storage/**', // A glob pattern for the path
  };

  nextConfig.images?.remotePatterns?.push(currentHost);
}

export default nextConfig;
