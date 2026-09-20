import type { NextConfig } from "next";

function allowedDevOrigins(): string[] {
  const raw = process.env.SHOPIFY_APP_URL;
  if (!raw) return [];

  try {
    return [new URL(raw).hostname];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["bullmq", "ioredis"],
  env: {
    NEXT_PUBLIC_SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ?? "",
  },
  allowedDevOrigins: allowedDevOrigins(),
};

export default nextConfig;
