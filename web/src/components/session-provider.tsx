"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { establishSession } from "@/actions/shopify/establish-session";
import { isEmbeddedAdmin, waitForAppBridge } from "@/lib/shopify/app-bridge";
import { callMerchantAction } from "@/lib/shopify/call-action";
import type { MerchantShop } from "@/lib/shopify/shop";

type SessionState =
  | { status: "loading" }
  | { status: "outside-admin" }
  | { status: "error"; message: string }
  | { status: "ready"; shop: MerchantShop };

const SessionContext = createContext<SessionState>({ status: "loading" });

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const ready = await waitForAppBridge();
      if (cancelled) return;

      if (!ready) {
        setState(
          isEmbeddedAdmin()
            ? {
                status: "error",
                message: "App Bridge did not load. Refresh the app in Shopify Admin.",
              }
            : { status: "outside-admin" },
        );
        return;
      }

      const result = await callMerchantAction(establishSession);
      if (cancelled) return;

      if (!result.success) {
        setState({ status: "error", message: result.error });
        return;
      }

      setState({ status: "ready", shop: result.payload });
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SessionContext.Provider value={state}>{children}</SessionContext.Provider>
  );
}
