import Link from "next/link";
import { listShops } from "@/lib/admin/shops";
import { formatDate } from "@/utils/format-date";

export default async function AdminStoresPage() {
  const shops = await listShops();

  return (
    <main className="page admin-page">
      <section className="card">
        <h1>Stores</h1>
        <p className="muted">{shops.length} installed {shops.length === 1 ? "shop" : "shops"}.</p>
        {shops.length === 0 ? (
          <p className="muted">Nothing here yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Currency</th>
                <th>Installed</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <Link href={`/admin/stores/${shop.id}`}>{shop.name ?? shop.domain}</Link>
                    <div className="muted">{shop.domain}</div>
                  </td>
                  <td>{shop.currency ?? "—"}</td>
                  <td>{formatDate(shop.installedAt)}</td>
                  <td>
                    <span className={shop.uninstalledAt ? "badge badge-warn" : "badge badge-ok"}>
                      {shop.uninstalledAt ? "Uninstalled" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
