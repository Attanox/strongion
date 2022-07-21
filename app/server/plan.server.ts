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

export async function listPlans(traineeId: string) {
  const plans = await prisma.plan.findMany({
    where: {
      traineeId,
    },
  });

  return plans;
}

export async function getPlanAndPhases(id: string) {
  const plan = await prisma.plan.findFirst({
    where: {
      id,
    },
  });

  const phases = await prisma.phase.findMany({
    where: {
      planId: id,
    },
  });

  return { plan, phases };
}
