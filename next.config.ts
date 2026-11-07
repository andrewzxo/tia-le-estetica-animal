import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" é usado apenas fora da Vercel (execução self-hosted do sandbox).
  // Na Vercel, o standalone quebra o registro das funções serverless (404 em todas
  // as rotas), então o output fica padrão — a Vercel usa o próprio tracing dela.
  output: process.env.VERCEL === "1" ? undefined : "standalone",
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
