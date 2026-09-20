import { prisma } from "@/lib/prisma";
import type { WebhookProcessor } from "@/jobs/types";

type ShopUpdatePayload = {
  name?: string;
  email?: string;
  currency?: string;
  iana_timezone?: string;
  timezone?: string;
  plan_name?: string;
};

export const processShopUpdate: WebhookProcessor = async (job) => {
  const { shop, payload } = job.data;
  const data = payload as ShopUpdatePayload;

  await prisma.shop.updateMany({
    where: { domain: shop },
    data: {
      name: data.name,
      email: data.email,
      currency: data.currency,
      timezone: data.iana_timezone ?? data.timezone,
      planName: data.plan_name,
    },
  });
};
