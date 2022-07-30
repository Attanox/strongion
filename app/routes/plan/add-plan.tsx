import * as React from "react";
import {
  type LoaderFunction,
  type ActionFunction,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getUser } from "server/user.server";
import Layout from "components/Layout";
import { createPlan } from "server/plan.server";
import { createPhase } from "server/phase.server";
import type { ErrorData } from "types/index.server";
import { authenticateUser } from "auth/authenticateUser";
import qs from "qs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const Input = (props: { label: string; name: string; required?: boolean }) => {
  const { required = false } = props;
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">{props.label}</span>
      </label>
      <input
        type="text"
        id={props.name}
        name={props.name}
        required={required}
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
      />
    </div>
  );
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticateUser(request);

  return user;
};

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);

  const text = await request.text();
  const parsed = qs.parse(text) as {
    phases: { title: string; description: string }[];
    planTitle: string;
  };

  const planTitle = parsed.planTitle;

  if (typeof planTitle !== "string") throw new Error("Wrong type");

  // 1. create a plan with author id of user
  if (!user?.id || !planTitle) {
    return json<ErrorData>({
      error: {
        body: "no title filled out",
        status: 400,
      },
    });
  }

  try {
    const plan = await createPlan(user?.id, planTitle);

    // 2. loop through created phase info and create phases in db
    for (let index = 0; index < parsed.phases.length; index++) {
      const phase = parsed.phases[index];
      const { title = "", description = "" } = phase;

      if (!title) {
        return json<ErrorData>({
          error: {
            body: `missing title for phase #${index}`,
            status: 400,
          },
        });
      }
      await createPhase(plan.id, title, description);
    }

    return redirect(`/plan/${plan.id}/edit`);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return json({
          error: { body: `Plan, with that name, already exists`, status: 400 },
        });
      }
    }
  }
};

const AddPlan = () => {
  const [phases, setPhases] = React.useState(1);

  const increasePhases = () => setPhases(phases + 1);
  const decreasePhases = () => setPhases(phases - 1 < 1 ? 1 : phases - 1);

  const user = useLoaderData<Awaited<ReturnType<typeof getUser>>>();

  const data = useActionData<ErrorData>();

  if (!user) return null;

  return (
    <Layout user={user}>
      <Form method="post" action="/plan/add-plan">
        <div className="mx-auto flex flex-col w-1/2 card card-bordered py-8 px-4">
          <h1 className="card-title">Create new plan!</h1>

          <div className="h-4" />

          <Input label="* Name of the plan" name="planTitle" required />

          <div className="flex flex-col">
            {new Array(phases).fill(0).map((el, idx) => {
              return (
                <div key={idx} className="flex">
                  <Input
                    label="* Phase"
                    name={`phases[${idx}][title]`}
                    required
                  />
                  <div className="inline-block w-4" />
                  <Input
                    label="Description"
                    name={`phases[${idx}][description]`}
                  />
                </div>
              );
            })}
          </div>

          <div className="h-2" />

          <div className="w-full flex item-center justify-center">
            <button
              type="button"
              onClick={increasePhases}
              className="btn btn-sm btn-success"
            >
              +
            </button>
            <div className="w-4" />
            <button
              type="button"
              onClick={decreasePhases}
              className="btn btn-sm btn-error"
            >
              -
            </button>
          </div>

          <div className="h-8" />

          <button type="submit" className="btn btn-primary">
            Create Plan
          </button>
        </div>
      </Form>
      {data?.error && (
        <div
          className="mx-auto alert alert-error shadow-lg w-1/2 my-3"
          role="alert"
        >
          {data.error.body}
        </div>
      )}
    </Layout>
  );
};

export default AddPlan;
