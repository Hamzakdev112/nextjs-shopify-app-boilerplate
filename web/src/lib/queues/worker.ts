import { Worker } from "bullmq";
import { getRedis } from "@/lib/redis";
import { webhookJobs } from "@/lib/queues/registry";

export function startWorkers(): Worker[] {
  return Object.values(webhookJobs).map(({ queueName, process }) => {
    const worker = new Worker(queueName, process, {
      connection: getRedis(),
    });

    worker.on("completed", (job) => {
      console.log(`[worker] ${queueName} ${job.id} completed`);
    });

    worker.on("failed", (job, error) => {
      console.error(`[worker] ${queueName} ${job?.id} failed: ${error.message}`);
    });

    return worker;
  });
}
