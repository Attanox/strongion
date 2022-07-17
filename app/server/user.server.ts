import * as bcrypt from "bcrypt";
import { prisma } from "lib/prisma.server";

import type { RegisterForm } from "types/index.server";
import { getUserSession, logout } from "./auth.server";

export const createUser = async (user: RegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      name: user.name,
      password: passwordHash,
    },
  });
  return { id: newUser.id, name: user.name };
};

export async function getUserId(req: Request) {
  const session = await getUserSession(req);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
}
