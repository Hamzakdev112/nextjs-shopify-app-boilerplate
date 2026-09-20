import type { Shop } from "@prisma/client";

export type MerchantShop = {
  domain: string;
  name: string | null;
  email: string | null;
  currency: string | null;
  timezone: string | null;
  planName: string | null;
  scope: string | null;
  installedAt: string;
};

export function toMerchantShop(shop: Shop): MerchantShop {
  return {
    domain: shop.domain,
    name: shop.name,
    email: shop.email,
    currency: shop.currency,
    timezone: shop.timezone,
    planName: shop.planName,
    scope: shop.scope,
    installedAt: shop.installedAt.toISOString(),
  };
}
