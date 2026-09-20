import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/admin/staff-session";

export class AdminAuthError extends Error {
  actionErrorCode = "UNAUTHORIZED" as const;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export type AdminUser = {
  id: string;
  email: string;
  name: string;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getStaffSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  });

  return user;
}

export async function requireAdminUser(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) {
    throw new AdminAuthError();
  }
  return user;
}

export async function requireAdminShop(id: string) {
  await requireAdminUser();

  const shop = await prisma.shop.findUnique({ where: { id } });
  if (!shop) {
    throw new Error(`Shop not found: ${id}`);
  }
  return shop;
}
