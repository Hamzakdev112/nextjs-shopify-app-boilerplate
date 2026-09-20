import { requireMerchantFromIdToken } from "@/lib/shopify/id-token";
import { toMerchantShop, type MerchantShop } from "@/lib/shopify/shop";
import { exchangeOfflineToken } from "@/lib/shopify/token-exchange";

export async function establishMerchantSession(idToken: string): Promise<MerchantShop> {
  const { shop, token } = await requireMerchantFromIdToken(idToken);
  const record = await exchangeOfflineToken(shop, token);
  return toMerchantShop(record);
}
