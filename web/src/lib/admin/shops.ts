import { prisma } from "@/lib/prisma";

export async function listShops() {
  return prisma.shop.findMany({
    orderBy: { installedAt: "desc" },
    select: {
      id: true,
      domain: true,
      name: true,
      planName: true,
      currency: true,
      installedAt: true,
      uninstalledAt: true,
    },
  });
}

export async function loadShop(id: string) {
  return prisma.shop.findUnique({
    where: { id },
    select: {
      id: true,
      domain: true,
      name: true,
      email: true,
      currency: true,
      timezone: true,
      planName: true,
      scope: true,
      installedAt: true,
      uninstalledAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function shopCounts() {
  const [total, active, uninstalled] = await Promise.all([
    prisma.shop.count(),
    prisma.shop.count({ where: { uninstalledAt: null } }),
    prisma.shop.count({ where: { uninstalledAt: { not: null } } }),
  ]);

  return { total, active, uninstalled };
}
