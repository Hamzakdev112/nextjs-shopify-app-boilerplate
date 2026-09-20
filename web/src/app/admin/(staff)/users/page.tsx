import { listUsers } from "@/lib/admin/users";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { formatDate } from "@/utils/format-date";

export default async function AdminUsersPage() {
  const users = await listUsers();

  return (
    <main className="page admin-page">
      <section className="card">
        <h1>Staff users</h1>
        <p className="muted">People who can open this admin. Not merchants.</p>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Add user</h2>
        <CreateUserForm />
      </section>
    </main>
  );
}
