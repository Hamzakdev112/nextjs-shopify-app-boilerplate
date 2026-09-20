import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyShopifyWebhook } from "@/lib/shopify/webhook";

describe("verifyShopifyWebhook", () => {
  const secret = "shopify-secret";
  const body = Buffer.from('{"id":1}');

  it("accepts a matching hmac", () => {
    const hmac = createHmac("sha256", secret).update(body).digest("base64");
    expect(verifyShopifyWebhook(body, hmac, secret)).toBe(true);
  });

  it("rejects a missing or mismatched hmac", () => {
    expect(verifyShopifyWebhook(body, null, secret)).toBe(false);
    expect(verifyShopifyWebhook(body, "nope", secret)).toBe(false);
  });
});
