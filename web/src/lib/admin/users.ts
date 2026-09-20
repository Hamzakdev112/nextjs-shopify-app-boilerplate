import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/utils/password";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
}

export async function authenticateStaff(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }
  return { id: user.id, email: user.email, name: user.name };
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  if (!email || !name || input.password.length < 8) {
    throw new Error("Name, email, and a password of at least 8 characters are required");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("A staff user with that email already exists");
  }

  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(input.password),
    },
    select: { id: true, email: true, name: true },
  });
}

export async function updateUserPassword(userId: string, password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(password) },
  });
}

export async function userCount() {
  return prisma.user.count();
}
