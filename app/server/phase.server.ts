import { prisma } from "lib/prisma.server";

export async function createPhase(
  planId: string,
  title: string,
  description: string
) {
  const phase = await prisma.phase.create({
    data: {
      title,
      description,
      planId,
    },
  });

  return phase;
}

export async function getPhasesByPlan(planId: string) {
  const phases = await prisma.plan
    .findFirst({
      where: {
        id: planId,
      },
    })
    .phases();

  return phases;
}

export async function addExercisesToPhase(
  data: {
    phaseId: string;
    name: string;
    exerciseData: {
      sets: number;
      reps: number;
    };
  }[]
) {
  const exercises = await prisma.exercise.createMany({
    data,
  });

  return exercises;
}

export async function removePhaseExercises(phaseId: string) {
  const deleted = await prisma.exercise.deleteMany({
    where: {
      phaseId,
    },
  });
  return deleted;
}
