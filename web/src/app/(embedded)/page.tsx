"use client";

import { useSession } from "@/components/session-provider";

export default function HomePage() {
  const session = useSession();
  if (session.status !== "ready") return null;

  const { shop } = session;

  return (
    <main className="page">
      <section className="card">
        <h1>{shop.name ?? shop.domain}</h1>
        <p className="muted">Connected and running inside Shopify Admin.</p>
        <dl className="grid">
          <div className="field">
            <dt>Store</dt>
            <dd>{shop.domain}</dd>
          </div>
          <div className="field">
            <dt>Plan</dt>
            <dd>{shop.planName ?? "—"}</dd>
          </div>
          <div className="field">
            <dt>Currency</dt>
            <dd>{shop.currency ?? "—"}</dd>
          </div>
          <div className="field">
            <dt>Timezone</dt>
            <dd>{shop.timezone ?? "—"}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
