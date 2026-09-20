"use server";

import {
  actionFailFromError,
  actionOk,
  type ActionResponse,
} from "@/lib/core/action-response";
import { establishMerchantSession } from "@/lib/shopify/establish-session";
import type { MerchantShop } from "@/lib/shopify/shop";

export async function establishSession(
  idToken: string,
): Promise<ActionResponse<MerchantShop>> {
  try {
    const shop = await establishMerchantSession(idToken);
    return actionOk(shop);
  } catch (error) {
    return actionFailFromError(error);
  }
}
