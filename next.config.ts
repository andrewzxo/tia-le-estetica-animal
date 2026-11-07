import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false,
  /** Inclui o snapshot do banco no bundle de deploy (usado na Vercel) */
  outputFileTracingIncludes: {
    "/**": ["./db/seed.db"],
  },
};

export default nextConfig;
