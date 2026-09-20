import type { Shop } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getShopifyApi } from "@/lib/shopify/client";
import { getOfflineSession } from "@/lib/shopify/session";

const SHOP_QUERY = `#graphql
  query ShopProfile {
    shop {
      name
      email
      myshopifyDomain
      currencyCode
      ianaTimezone
      plan {
        displayName
      }
    }
  }
`;

type ShopProfileQuery = {
  shop: {
    name: string;
    email: string;
    myshopifyDomain: string;
    currencyCode: string;
    ianaTimezone: string;
    plan: { displayName: string };
  };
};

export async function shopifyGraphql<T>(
  domain: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const session = await getOfflineSession(domain);
  const client = new (getShopifyApi().clients.Graphql)({ session });
  const response = await client.request<T>(query, { variables });
  if (!response.data) {
    throw new Error("Shopify Admin API returned no data");
  }
  return response.data;
}

export async function syncShopProfile(domain: string): Promise<Shop> {
  const data = await shopifyGraphql<ShopProfileQuery>(domain, SHOP_QUERY);

  return prisma.shop.update({
    where: { domain },
    data: {
      name: data.shop.name,
      email: data.shop.email,
      currency: data.shop.currencyCode,
      timezone: data.shop.ianaTimezone,
      planName: data.shop.plan.displayName,
    },
  });
}
