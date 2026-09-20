import { Redis } from "ioredis";
import { optionalEnv } from "@/lib/env";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createClient(): Redis {
  const url = optionalEnv("REDIS_URL");
  if (url) {
    return new Redis(url, { maxRetriesPerRequest: null });
  }

  return new Redis({
    host: optionalEnv("REDIS_HOST", "127.0.0.1") ?? "127.0.0.1",
    port: Number(optionalEnv("REDIS_PORT", "6379") ?? "6379"),
    password: optionalEnv("REDIS_PASSWORD") || undefined,
    db: Number(optionalEnv("REDIS_DB", "0") ?? "0"),
    maxRetriesPerRequest: null,
  });
}

export function getRedis(): Redis {
  if (globalForRedis.redis) {
    return globalForRedis.redis;
  }

  const client = createClient();
  globalForRedis.redis = client;
  return client;
}
