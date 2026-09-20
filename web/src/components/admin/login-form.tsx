"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginStaff } from "@/actions/admin/login";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await loginStaff(
      String(form.get("email") ?? ""),
      String(form.get("password") ?? ""),
    );

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Email
        <input className="input" name="email" type="email" required autoComplete="username" />
      </label>
      <label>
        Password
        <input
          className="input"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
