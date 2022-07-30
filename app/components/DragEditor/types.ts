import { type getPlanAndPhases } from "server/plan.server";

export type TPhases = Awaited<ReturnType<typeof getPlanAndPhases>>["phases"];

export type DndExercise = {
  name: string;
  id: string;
  info: {
    reps: number;
    sets: number;
  };
};
