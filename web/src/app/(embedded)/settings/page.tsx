"use client";

import { useSession } from "@/components/session-provider";
import { formatDate } from "@/utils/format-date";

export default function SettingsPage() {
  const session = useSession();
  if (session.status !== "ready") return null;

  return (
    <main className="page">
      <section className="card">
        <h1>Settings</h1>
        <p className="muted">
          Add merchant configuration here. UI work goes through a server action
          in <code>actions/shopify</code> (or the matching department folder).
        </p>
        <dl className="grid">
          <div className="field">
            <dt>Granted scopes</dt>
            <dd>{session.shop.scope ?? "—"}</dd>
          </div>
          <div className="field">
            <dt>Installed</dt>
            <dd>{formatDate(session.shop.installedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>Add a webhook</h2>
        <p className="muted">
          Register the topic in <code>shopify.app.toml</code>, then add a
          processor in <code>web/src/jobs/webhooks</code> and map it in{" "}
          <code>web/src/lib/queues/registry.ts</code>.
        </p>
      </section>
    </main>
  );
}
