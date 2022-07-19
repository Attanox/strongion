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
