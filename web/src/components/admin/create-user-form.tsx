"use client";

import { useState } from "react";
import { createStaffUser } from "@/actions/admin/create-user";

export function CreateUserForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const result = await createStaffUser({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    form.reset();
    setPending(false);
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Name
        <input className="input" name="name" required />
      </label>
      <label>
        Email
        <input className="input" name="email" type="email" required />
      </label>
      <label>
        Password
        <input className="input" name="password" type="password" minLength={8} required />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Add staff user"}
      </button>
    </form>
  );
}
