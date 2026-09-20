import { hmacDigest, hmacEqual } from "@/utils/hmac";

export function verifyShopifyWebhook(
  rawBody: Buffer,
  hmac: string | null,
  secret: string,
): boolean {
  if (!hmac) return false;
  return hmacEqual(hmacDigest(rawBody, secret, "base64"), hmac);
}
