import { prisma } from "lib/prisma.server";

export async function createPlan(traineeId: string, title: string) {
  const plan = await prisma.plan.create({
    data: {
      title,
      traineeId,
    },
  });

  return plan;
}
