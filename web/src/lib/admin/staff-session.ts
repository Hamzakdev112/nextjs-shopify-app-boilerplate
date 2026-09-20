import { cookies } from "next/headers";
import { env, optionalEnv } from "@/lib/env";
import { parseSignedPayload, signPayload } from "@/utils/signed-payload";

export const STAFF_SESSION_COOKIE = "staff_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type StaffSessionPayload = {
  userId: string;
  exp: number;
};

function signingSecret(): string {
  return optionalEnv("ADMIN_SESSION_SECRET") ?? env("SHOPIFY_API_SECRET");
}

export function createStaffSessionToken(userId: string): string {
  const payload: StaffSessionPayload = {
    userId,
    exp: Date.now() + SESSION_TTL_MS,
  };
  return signPayload(payload, signingSecret());
}

export function parseStaffSessionToken(token: string | undefined | null): StaffSessionPayload | null {
  const payload = parseSignedPayload<StaffSessionPayload>(token, signingSecret());
  if (!payload?.userId || payload.exp < Date.now()) return null;
  return payload;
}

export function staffSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export async function getStaffSession(): Promise<StaffSessionPayload | null> {
  try {
    const jar = await cookies();
    return parseStaffSessionToken(jar.get(STAFF_SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

export async function setStaffSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(STAFF_SESSION_COOKIE, createStaffSessionToken(userId), staffSessionCookieOptions());
}

export async function clearStaffSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(STAFF_SESSION_COOKIE);
}
