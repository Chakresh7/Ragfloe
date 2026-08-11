import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Chrome/dev tools when opening via 127.0.0.1 instead of localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
