"use client";

import type { ReactNode } from "react";
import { useSession } from "@/components/session-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const session = useSession();

  if (session.status === "loading") {
    return (
      <main className="page">
        <p className="muted">Connecting to Shopify…</p>
      </main>
    );
  }

  if (session.status === "outside-admin") {
    return (
      <main className="page">
        <section className="card">
          <h1>Open from Shopify Admin</h1>
          <p className="muted">
            This app is embedded. Install it on a development store, then launch
            it from Apps in the Shopify admin.
          </p>
        </section>
      </main>
    );
  }

  if (session.status === "error") {
    return (
      <main className="page">
        <section className="card">
          <h1>Couldn’t connect</h1>
          <p className="muted">{session.message}</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
