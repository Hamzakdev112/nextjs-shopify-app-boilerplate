import { createHmac, timingSafeEqual } from "node:crypto";

export function hmacDigest(value: string | Buffer, secret: string, encoding: "base64" | "base64url"): string {
  return createHmac("sha256", secret).update(value).digest(encoding);
}

export function hmacEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
