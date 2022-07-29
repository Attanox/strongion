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

  const dbPhases = await prisma.phase.findMany({
    where: {
      planId: id,
    },
  });

  const phases = [];

  for (let index = 0; index < dbPhases.length; index++) {
    const phase = dbPhases[index];

    const selected = await prisma.phase.findFirst({
      where: {
        id: phase.id,
      },
      select: {
        exercises: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    phases.push({ ...phase, exercises: selected?.exercises || [] });
  }

  return { plan, phases };
}
