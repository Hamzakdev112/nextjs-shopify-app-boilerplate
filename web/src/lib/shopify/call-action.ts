"use client";

import type { ActionResponse } from "@/lib/core/action-response";
import { waitForAppBridge } from "@/lib/shopify/app-bridge";

export async function callMerchantAction<T>(
  action: (idToken: string) => Promise<ActionResponse<T>>,
): Promise<ActionResponse<T>> {
  const ready = await waitForAppBridge();
  if (!ready || !window.shopify) {
    return {
      success: false,
      error: "App Bridge is not available. Open the app from Shopify Admin.",
      code: "UNAUTHORIZED",
    };
  }

  const run = async () => action(await window.shopify!.idToken());
  const first = await run();
  if (!first.success && first.code === "UNAUTHORIZED") {
    return run();
  }
  return first;
}
