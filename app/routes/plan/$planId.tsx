import React from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
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

type LoaderData = {
  user: Awaited<ReturnType<typeof authenticateUser>>;
  plan: Awaited<ReturnType<typeof getPlanAndPhases>>["plan"];
  phases: Awaited<ReturnType<typeof getPlanAndPhases>>["phases"];
};

export const action: ActionFunction = async ({ request }) => {
  const text = await request.text();
  return qs.parse(text);
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
  const data = useActionData();

  console.log("data", data);

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
