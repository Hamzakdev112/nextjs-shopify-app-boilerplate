import { ApiVersion, LogSeverity, shopifyApi } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/web-api";
import { env, optionalEnv } from "@/lib/env";

export type ShopifyApi = ReturnType<typeof shopifyApi>;

const globalForShopify = globalThis as unknown as {
  shopifyApi: ShopifyApi | undefined;
};

function scopesFromEnv(): string[] {
  return (optionalEnv("SHOPIFY_API_SCOPES", "read_products") ?? "read_products")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export function getShopifyApi(): ShopifyApi {
  if (globalForShopify.shopifyApi) {
    return globalForShopify.shopifyApi;
  }

  const hostName = env("SHOPIFY_APP_URL").replace(/^https?:\/\//, "").replace(/\/$/, "");

  const api = shopifyApi({
    apiKey: env("SHOPIFY_API_KEY"),
    apiSecretKey: env("SHOPIFY_API_SECRET"),
    hostName,
    hostScheme: "https",
    apiVersion: ApiVersion.January26,
    isEmbeddedApp: true,
    scopes: scopesFromEnv(),
    logger: {
      level: process.env.NODE_ENV === "development" ? LogSeverity.Info : LogSeverity.Error,
    },
  });

  globalForShopify.shopifyApi = api;
  return api;
}
