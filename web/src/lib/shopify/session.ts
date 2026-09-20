import { Session } from "@shopify/shopify-api";
import type { Shop } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { getShopifyApi } from "@/lib/shopify/client";

const REFRESH_SKEW_MS = 5 * 60 * 1000;
const LOCK_TTL_MS = 10_000;

export function sessionFromShop(shop: Shop): Session {
  return new Session({
    id: getShopifyApi().session.getOfflineId(shop.domain),
    shop: shop.domain,
    state: "",
    isOnline: false,
    accessToken: shop.accessToken ?? undefined,
    expires: shop.accessTokenExpiresAt ?? undefined,
    refreshToken: shop.refreshToken ?? undefined,
    scope: shop.scope ?? undefined,
  });
}

export async function persistOfflineSession(session: Session): Promise<Shop> {
  const now = new Date();

  return prisma.shop.upsert({
    where: { domain: session.shop },
    create: {
      domain: session.shop,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiresAt: session.expires ?? null,
      scope: session.scope ?? null,
      installedAt: now,
      uninstalledAt: null,
    },
    update: {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiresAt: session.expires ?? null,
      scope: session.scope ?? null,
      uninstalledAt: null,
    },
  });
}

export async function markShopInstalled(domain: string): Promise<void> {
  const existing = await prisma.shop.findUnique({
    where: { domain },
    select: { uninstalledAt: true },
  });

  await prisma.shop.update({
    where: { domain },
    data: {
      uninstalledAt: null,
      ...(existing?.uninstalledAt ? { installedAt: new Date() } : {}),
    },
  });
}

function isFresh(shop: Shop): boolean {
  if (!shop.accessToken) return false;
  if (!shop.accessTokenExpiresAt) return true;
  return shop.accessTokenExpiresAt.getTime() - Date.now() > REFRESH_SKEW_MS;
}

async function withShopLock<T>(domain: string, fn: () => Promise<T>): Promise<T> {
  const redis = getRedis();
  const key = `lock:shop-token:${domain}`;
  const started = Date.now();

  while (Date.now() - started < LOCK_TTL_MS) {
    const acquired = await redis.set(key, "1", "PX", LOCK_TTL_MS, "NX");
    if (acquired) {
      try {
        return await fn();
      } finally {
        await redis.del(key);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 75));
  }

  return fn();
}

export async function getOfflineSession(domain: string): Promise<Session> {
  const shop = await prisma.shop.findUnique({ where: { domain } });
  if (!shop || (!shop.accessToken && !shop.refreshToken)) {
    throw new Error(`No offline session for ${domain}`);
  }

  if (isFresh(shop)) {
    return sessionFromShop(shop);
  }

  return withShopLock(domain, async () => {
    const latest = await prisma.shop.findUnique({ where: { domain } });
    if (!latest) {
      throw new Error(`No offline session for ${domain}`);
    }
    if (isFresh(latest)) {
      return sessionFromShop(latest);
    }
    if (!latest.refreshToken) {
      throw new Error(`Offline session for ${domain} needs a fresh token exchange`);
    }

    const { session } = await getShopifyApi().auth.refreshToken({
      shop: domain,
      refreshToken: latest.refreshToken,
    });
    const persisted = await persistOfflineSession(session);
    return sessionFromShop(persisted);
  });
}
