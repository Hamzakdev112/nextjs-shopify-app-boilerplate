"use client";

import { useState } from "react";
import { retryStaffJob } from "@/actions/admin/retry-job";

export function RetryButton({ queueName, jobId }: { queueName: string; jobId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = await retryStaffJob(queueName, jobId);
    if (!result.success) {
      setError(result.error);
    }
    setPending(false);
  }

  return (
    <span>
      <button className="btn-text" type="button" onClick={onClick} disabled={pending}>
        {pending ? "Retrying…" : "Retry"}
      </button>
      {error ? <span className="form-error"> {error}</span> : null}
    </span>
  );
}
