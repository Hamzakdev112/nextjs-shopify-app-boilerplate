import type { Job } from "bullmq";

export type WebhookJobData = {
  shop: string;
  payload: unknown;
};

export type WebhookProcessor = (job: Job<WebhookJobData>) => Promise<void>;
