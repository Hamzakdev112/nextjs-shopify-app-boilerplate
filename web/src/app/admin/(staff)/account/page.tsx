import { getAdminUser } from "@/lib/admin/auth";
import { PasswordForm } from "@/components/admin/password-form";
import { redirect } from "next/navigation";

export default async function AdminAccountPage() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="page admin-page">
      <section className="card">
        <h1>Account</h1>
        <dl className="grid">
          <div className="field">
            <dt>Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div className="field">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
      </section>
      <section className="card">
        <h2>Password</h2>
        <PasswordForm />
      </section>
    </main>
  );
}
