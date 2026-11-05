import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Planify",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
