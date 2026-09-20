import Link from "next/link";
import { notFound } from "next/navigation";
import { loadShop } from "@/lib/admin/shops";
import { formatDateTime } from "@/utils/format-date";

export default async function AdminStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = await loadShop(id);
  if (!shop) notFound();

  return (
    <main className="page admin-page">
      <p>
        <Link href="/admin/stores">← Stores</Link>
      </p>
      <section className="card">
        <h1>{shop.name ?? shop.domain}</h1>
        <p className="muted">{shop.domain}</p>
        <dl className="grid">
          <div className="field">
            <dt>Status</dt>
            <dd>{shop.uninstalledAt ? "Uninstalled" : "Active"}</dd>
          </div>
          <div className="field">
            <dt>Plan</dt>
            <dd>{shop.planName ?? "—"}</dd>
          </div>
          <div className="field">
            <dt>Email</dt>
            <dd>{shop.email ?? "—"}</dd>
          </div>
          <div className="field">
            <dt>Currency</dt>
            <dd>{shop.currency ?? "—"}</dd>
          </div>
          <div className="field">
            <dt>Timezone</dt>
            <dd>{shop.timezone ?? "—"}</dd>
          </div>
          <div className="field">
            <dt>Scopes</dt>
            <dd>{shop.scope ?? "—"}</dd>
          </div>
          <div className="field">
            <dt>Installed</dt>
            <dd>{formatDateTime(shop.installedAt)}</dd>
          </div>
          <div className="field">
            <dt>Uninstalled</dt>
            <dd>{shop.uninstalledAt ? formatDateTime(shop.uninstalledAt) : "—"}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
