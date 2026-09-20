import Link from "next/link";
import { RetryButton } from "@/components/admin/retry-button";
import {
  loadJobs,
  loadQueueStats,
  queueNames,
  type JobStatus,
} from "@/lib/admin/jobs";
import { formatDateTime } from "@/utils/format-date";

const STATUSES: Array<JobStatus | "all"> = [
  "all",
  "failed",
  "completed",
  "active",
  "wait",
  "delayed",
];

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ queue?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const names = queueNames();
  const queueName = names.includes(params.queue ?? "") ? params.queue! : names[0];
  const status = (STATUSES.includes((params.status ?? "all") as JobStatus | "all")
    ? params.status ?? "all"
    : "all") as JobStatus | "all";
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const [stats, { jobs, total }] = await Promise.all([
    loadQueueStats(),
    loadJobs({ queueName, status, page }),
  ]);

  const pageSize = 25;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="page admin-page">
      <section className="card">
        <h1>Jobs</h1>
        <p className="muted">BullMQ queues used by Shopify webhooks.</p>
        <dl className="grid">
          {Object.entries(stats).map(([name, counts]) => (
            <div className="field" key={name}>
              <dt>{name}</dt>
              <dd>
                {counts.failed} failed · {counts.completed} done
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card">
        <div className="filter-row">
          {names.map((name) => (
            <Link
              key={name}
              className={name === queueName ? "chip chip-active" : "chip"}
              href={`/admin/jobs?queue=${name}&status=${status}`}
            >
              {name}
            </Link>
          ))}
        </div>
        <div className="filter-row">
          {STATUSES.map((value) => (
            <Link
              key={value}
              className={value === status ? "chip chip-active" : "chip"}
              href={`/admin/jobs?queue=${queueName}&status=${value}`}
            >
              {value}
            </Link>
          ))}
        </div>

        {jobs.length === 0 ? (
          <p className="muted">No jobs in this view.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Shop</th>
                <th>Status</th>
                <th>When</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={`${job.queueName}-${job.id}`}>
                  <td>
                    <code>{job.id}</code>
                    <div className="muted">{job.name}</div>
                  </td>
                  <td>{job.shop ?? "—"}</td>
                  <td>
                    <span className={job.status === "failed" ? "badge badge-warn" : "badge"}>
                      {job.status}
                    </span>
                    {job.failedReason ? <div className="muted">{job.failedReason}</div> : null}
                  </td>
                  <td>{formatDateTime(job.timestamp)}</td>
                  <td>
                    {job.status === "failed" ? (
                      <RetryButton queueName={job.queueName} jobId={job.id} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 ? (
          <p className="muted">
            Page {page} of {totalPages}
            {page < totalPages ? (
              <>
                {" · "}
                <Link href={`/admin/jobs?queue=${queueName}&status=${status}&page=${page + 1}`}>
                  Next
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
      </section>
    </main>
  );
}
