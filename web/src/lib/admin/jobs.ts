import type { Job } from "bullmq";
import { getWebhookQueue } from "@/lib/queues/enqueue";
import { webhookJobs } from "@/lib/queues/registry";

export type JobStatus = "wait" | "active" | "completed" | "failed" | "delayed" | "paused";

export type JobRow = {
  id: string;
  name: string;
  queueName: string;
  status: JobStatus;
  shop: string | null;
  attempts: number;
  timestamp: number;
  failedReason: string | null;
};

export type QueueCounts = {
  wait: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
};

const STATUSES: JobStatus[] = ["wait", "active", "completed", "failed", "delayed", "paused"];

export function queueNames(): string[] {
  return [...new Set(Object.values(webhookJobs).map((entry) => entry.queueName))];
}

export function isQueueName(name: string): boolean {
  return queueNames().includes(name);
}

export async function loadQueueStats(): Promise<Record<string, QueueCounts>> {
  const stats: Record<string, QueueCounts> = {};

  for (const name of queueNames()) {
    const counts = await getWebhookQueue(name).getJobCounts(...STATUSES);
    stats[name] = {
      wait: counts.wait ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
      paused: counts.paused ?? 0,
    };
  }

  return stats;
}

export async function loadJobs(input: {
  queueName: string;
  status: JobStatus | "all";
  page: number;
  pageSize?: number;
}): Promise<{ jobs: JobRow[]; total: number }> {
  if (!isQueueName(input.queueName)) {
    throw new Error("Unknown queue");
  }

  const pageSize = input.pageSize ?? 25;
  const queue = getWebhookQueue(input.queueName);
  const statuses = input.status === "all" ? STATUSES : [input.status];
  const counts = await queue.getJobCounts(...statuses);

  let total = 0;
  for (const status of statuses) {
    total += counts[status] ?? 0;
  }

  const start = Math.max(0, (input.page - 1) * pageSize);
  const jobs: JobRow[] = [];

  for (const status of statuses) {
    if (jobs.length >= pageSize) break;
    const batch = await queue.getJobs([status], 0, pageSize + start - 1, false);
    for (const job of batch) {
      if (!job.id) continue;
      jobs.push(toRow(job, input.queueName, status));
    }
  }

  jobs.sort((a, b) => b.timestamp - a.timestamp);
  return {
    jobs: jobs.slice(start, start + pageSize),
    total,
  };
}

export async function retryFailedJob(queueName: string, jobId: string) {
  if (!isQueueName(queueName)) {
    throw new Error("Unknown queue");
  }

  const job = await getWebhookQueue(queueName).getJob(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  await job.retry();
}

function toRow(job: Job, queueName: string, status: JobStatus): JobRow {
  const data = job.data as { shop?: string };
  return {
    id: String(job.id),
    name: job.name,
    queueName,
    status,
    shop: data.shop ?? null,
    attempts: job.attemptsMade,
    timestamp: job.timestamp,
    failedReason: job.failedReason ?? null,
  };
}
