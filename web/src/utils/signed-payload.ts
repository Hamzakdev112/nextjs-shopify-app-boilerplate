import { hmacDigest, hmacEqual } from "@/utils/hmac";

export function signPayload(payload: unknown, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${hmacDigest(encoded, secret, "base64url")}`;
}

export function parseSignedPayload<T>(token: string | undefined | null, secret: string): T | null {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = hmacDigest(encoded, secret, "base64url");
  if (!hmacEqual(signature, expected)) return null;

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}
