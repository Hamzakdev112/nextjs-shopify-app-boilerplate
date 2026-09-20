import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/nav";

export const dynamic = "force-dynamic";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <AdminNav email={user.email} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
