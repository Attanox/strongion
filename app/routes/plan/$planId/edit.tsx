import React from "react";
import { useLoaderData } from "@remix-run/react";
import { authenticateUser } from "auth/authenticateUser";
import {
  type LoaderFunction,
  redirect,
  type ActionFunction,
} from "@remix-run/node";
import Layout from "components/Layout";
import { getPlanAndPhases } from "server/plan.server";
import { ClientOnly } from "remix-utils";
import DragEditor from "components/DragEditor.client";
import qs from "qs";
import {
  addExercisesToPhase,
  getPhasesByPlan,
  removePhaseExercises,
} from "server/phase.server";

type LoaderData = {
  user: Awaited<ReturnType<typeof authenticateUser>>;
  plan: Awaited<ReturnType<typeof getPlanAndPhases>>["plan"];
  phases: Awaited<ReturnType<typeof getPlanAndPhases>>["phases"];
};

type TPhaseData = {
  [id: string]: { title: string; sets: string; reps: string };
};

export const action: ActionFunction = async ({ request, params }) => {
  const { planId } = params;

  if (!planId) return null;

  const text = await request.text();
  const parsed = qs.parse(text) as { phase: TPhaseData[] };

  const phases = await getPhasesByPlan(planId);

  for (let index = 0; index < phases.length; index++) {
    const phase = phases[index];
    const phaseData = parsed.phase[index];

    const data = Object.values(phaseData).map((d) => ({
      name: d.title,
      exerciseData: { reps: Number(d.reps), sets: Number(d.sets) },
      phaseId: phase.id,
    }));

    // * remove all, then add them back
    await removePhaseExercises(phase.id);
    await addExercisesToPhase(data);
  }

  return redirect("/");
};

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const user = await authenticateUser(request);

  const { planId } = params;

  if (!planId) throw redirect("/");

  const { plan, phases } = await getPlanAndPhases(planId);

  if (!plan) throw redirect("/");

  return { user, plan, phases };
};

const PlanEditor = () => {
  const { user, plan, phases } = useLoaderData<LoaderData>();

  if (!user || !plan) return null;

  return (
    <Layout user={user}>
      <ClientOnly fallback={<div>Loading...</div>}>
        {() => <DragEditor plan={plan} phases={phases} />}
      </ClientOnly>
    </Layout>
  );
};

export default PlanEditor;
