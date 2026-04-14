import type { NextConfig } from "next";

const url = process.env.NEXT_PUBLIC_API_URL.split(":");
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

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [currentHost],
  },
};

export default nextConfig;
