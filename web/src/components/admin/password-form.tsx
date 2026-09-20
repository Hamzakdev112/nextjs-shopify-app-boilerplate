"use client";

import { useState } from "react";
import { updateOwnPassword } from "@/actions/admin/update-password";

export function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setOk(false);

    const form = event.currentTarget;
    const result = await updateOwnPassword(String(new FormData(form).get("password") ?? ""));

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    form.reset();
    setOk(true);
    setPending(false);
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        New password
        <input className="input" name="password" type="password" minLength={8} required />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      {ok ? <p className="muted">Password updated.</p> : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
