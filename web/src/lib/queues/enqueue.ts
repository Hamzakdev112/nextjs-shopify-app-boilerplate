import { Queue } from "bullmq";
import { getRedis } from "@/lib/redis";
import { isWebhookTopic, webhookJobs } from "@/lib/queues/registry";

const queues = new Map<string, Queue>();

export function getWebhookQueue(name: string): Queue {
  const existing = queues.get(name);
  if (existing) return existing;

  const queue = new Queue(name, {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 10_000 },
      removeOnComplete: { count: 1000, age: 60 * 60 * 24 * 7 },
      removeOnFail: { count: 500, age: 60 * 60 * 24 * 14 },
    },
  });

  queues.set(name, queue);
  return queue;
}

export async function enqueueWebhook(input: {
  topic: string;
  shop: string;
  payload: unknown;
  webhookId: string | null;
}): Promise<boolean> {
  if (!isWebhookTopic(input.topic)) {
    return false;
  }

  const { queueName } = webhookJobs[input.topic];
  await getWebhookQueue(queueName).add(
    input.topic,
    { shop: input.shop, payload: input.payload },
    { jobId: input.webhookId ?? undefined },
  );

  return true;
}
