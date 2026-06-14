import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/cinema/slides": ["./links.txt"],
  },
};

export default nextConfig;
