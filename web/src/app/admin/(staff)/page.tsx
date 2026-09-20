import Link from "next/link";
import { shopCounts, listShops } from "@/lib/admin/shops";
import { userCount } from "@/lib/admin/users";

export default async function AdminDashboardPage() {
  const [counts, users, recent] = await Promise.all([
    shopCounts(),
    userCount(),
    listShops().then((shops) => shops.slice(0, 8)),
  ]);

  return (
    <main className="page admin-page">
      <section className="card">
        <h1>Dashboard</h1>
        <p className="muted">Installed shops and staff accounts.</p>
        <dl className="grid">
          <div className="field">
            <dt>Shops</dt>
            <dd>{counts.total}</dd>
          </div>
          <div className="field">
            <dt>Active</dt>
            <dd>{counts.active}</dd>
          </div>
          <div className="field">
            <dt>Uninstalled</dt>
            <dd>{counts.uninstalled}</dd>
          </div>
          <div className="field">
            <dt>Staff</dt>
            <dd>{users}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <h2>Recent stores</h2>
        {recent.length === 0 ? (
          <p className="muted">No shops yet. Install the app on a development store.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Store</th>
                <th>Plan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <Link href={`/admin/stores/${shop.id}`}>{shop.name ?? shop.domain}</Link>
                    <div className="muted">{shop.domain}</div>
                  </td>
                  <td>{shop.planName ?? "—"}</td>
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
