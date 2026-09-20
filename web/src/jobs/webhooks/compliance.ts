import { prisma } from "@/lib/prisma";
import type { WebhookProcessor } from "@/jobs/types";

async function record(topic: string, shop: string, payload: unknown) {
  await prisma.complianceRequest.create({
    data: {
      topic,
      shop,
      payload: JSON.stringify(payload),
    },
  });
}

export const processCustomersDataRequest: WebhookProcessor = async (job) => {
  await record("customers/data_request", job.data.shop, job.data.payload);
};

export const processCustomersRedact: WebhookProcessor = async (job) => {
  await record("customers/redact", job.data.shop, job.data.payload);
};

export const processShopRedact: WebhookProcessor = async (job) => {
  await record("shop/redact", job.data.shop, job.data.payload);

  await prisma.shop.deleteMany({
    where: { domain: job.data.shop },
  });
};
