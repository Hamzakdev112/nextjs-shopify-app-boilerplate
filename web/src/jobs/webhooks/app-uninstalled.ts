import { prisma } from "@/lib/prisma";
import type { WebhookProcessor } from "@/jobs/types";

export const processAppUninstalled: WebhookProcessor = async (job) => {
  const { shop } = job.data;
  const now = new Date();

  await prisma.shop.updateMany({
    where: { domain: shop },
    data: {
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      uninstalledAt: now,
    },
  });
};
