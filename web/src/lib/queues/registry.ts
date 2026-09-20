import { processAppUninstalled } from "@/jobs/webhooks/app-uninstalled";
import {
  processCustomersDataRequest,
  processCustomersRedact,
  processShopRedact,
} from "@/jobs/webhooks/compliance";
import { processShopUpdate } from "@/jobs/webhooks/shop-update";
import type { WebhookProcessor } from "@/jobs/types";

export type WebhookTopic =
  | "app/uninstalled"
  | "shop/update"
  | "customers/data_request"
  | "customers/redact"
  | "shop/redact";

type QueueEntry = {
  queueName: string;
  process: WebhookProcessor;
};

export const webhookJobs: Record<WebhookTopic, QueueEntry> = {
  "app/uninstalled": {
    queueName: "app-uninstalled",
    process: processAppUninstalled,
  },
  "shop/update": {
    queueName: "shop-update",
    process: processShopUpdate,
  },
  "customers/data_request": {
    queueName: "customers-data-request",
    process: processCustomersDataRequest,
  },
  "customers/redact": {
    queueName: "customers-redact",
    process: processCustomersRedact,
  },
  "shop/redact": {
    queueName: "shop-redact",
    process: processShopRedact,
  },
};

export function isWebhookTopic(topic: string): topic is WebhookTopic {
  return topic in webhookJobs;
}
