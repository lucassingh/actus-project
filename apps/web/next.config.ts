import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  // pdf-parse uses pdfjs-dist which tries to require canvas/encoding in build-time
  // analysis. We only run pdf-parse server-side (Server Actions), so neither is needed.
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
      encoding: "./empty-module.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };
    return config;
  },
};

export default nextConfig;
