import { hostnameFromUrl } from "@/utils/hostname";
import { getShopifyApi } from "@/lib/shopify/client";

export type IdTokenPayload = Awaited<
  ReturnType<ReturnType<typeof getShopifyApi>["session"]["decodeSessionToken"]>
>;

export class MerchantAuthError extends Error {
  actionErrorCode = "UNAUTHORIZED" as const;

  constructor(message = "Invalid Shopify session") {
    super(message);
    this.name = "MerchantAuthError";
  }
}

export async function decodeIdToken(token: string): Promise<IdTokenPayload> {
  return getShopifyApi().session.decodeSessionToken(token);
}

export async function requireMerchantFromIdToken(idToken: string): Promise<{
  token: string;
  payload: IdTokenPayload;
  shop: string;
}> {
  if (!idToken.trim()) {
    throw new MerchantAuthError();
  }

  try {
    const payload = await decodeIdToken(idToken);
    return {
      token: idToken,
      payload,
      shop: hostnameFromUrl(payload.dest),
    };
  } catch {
    throw new MerchantAuthError();
  }
}
