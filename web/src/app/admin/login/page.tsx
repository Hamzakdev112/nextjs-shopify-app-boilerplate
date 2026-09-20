import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminUser()) {
    redirect("/admin");
  }

  return (
    <main className="admin-login">
      <section className="card">
        <h1>Staff admin</h1>
        <p className="muted">Internal only. This is not the merchant app.</p>
        <LoginForm />
      </section>
    </main>
  );
}
