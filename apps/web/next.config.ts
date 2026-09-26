import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

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

// The Sentry plugin only uploads source maps: without a token (local dev, CI) it's skipped.
export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
    })
  : nextConfig;
