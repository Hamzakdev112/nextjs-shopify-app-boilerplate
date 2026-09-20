import { RequestedTokenType } from "@shopify/shopify-api";
import type { Shop } from "@prisma/client";
import { getShopifyApi } from "@/lib/shopify/client";
import {
  getOfflineSession,
  markShopInstalled,
  persistOfflineSession,
} from "@/lib/shopify/session";
import { syncShopProfile } from "@/lib/shopify/graphql";

export async function exchangeOfflineToken(shop: string, sessionToken: string): Promise<Shop> {
  try {
    const existing = await getOfflineSession(shop);
    if (existing.accessToken) {
      await markShopInstalled(shop);
      return syncShopProfile(shop);
    }
  } catch {
    // First install, or the stored refresh token is gone.
  }

  const { session } = await getShopifyApi().auth.tokenExchange({
    shop,
    sessionToken,
    requestedTokenType: RequestedTokenType.OfflineAccessToken,
    expiring: true,
  });

  await persistOfflineSession(session);
  return syncShopProfile(shop);
}
