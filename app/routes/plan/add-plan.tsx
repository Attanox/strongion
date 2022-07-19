import * as React from "react";
import {
  type LoaderFunction,
  type ActionFunction,
  json,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getUser } from "server/user.server";
import Layout from "components/Layout";
import { createPlan } from "server/plan.server";
import { createPhase } from "server/phase.server";
import { ErrorData } from "types/index.server";

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
  const user = await getUser(request);

  if (!user) return redirect("auth/login");

  return user;
};

export const action: ActionFunction = async ({ request }) => {
  const user = await getUser(request);

  const formData = await request.formData();

  const planTitle = formData.get("plan-title");

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

  const plan = await createPlan(user?.id, planTitle);

  // 2. create phases with plan id of created plan
  const phasesInfo: {
    [key: string]: { title?: string; description?: string };
  } = {};
  for (const pair of formData.entries()) {
    const key = pair[0];
    const value = pair[1] as string;
    const split = key.split("-");

    if (split[0] === "phase") {
      const phaseNumber = split[2];
      const phaseAttribute = split[1];

      if (phaseAttribute === "title" || phaseAttribute === "description") {
        if (phasesInfo[phaseNumber])
          phasesInfo[phaseNumber] = {
            ...phasesInfo[phaseNumber],
            [phaseAttribute]: value,
          };
        else phasesInfo[phaseNumber] = { [phaseAttribute]: value };
      }
    }
  }

  // 3. loop through created phase info and create phases in db
  for (let index = 0; index < Object.keys(phasesInfo).length; index++) {
    const key = Object.keys(phasesInfo)[index];
    const { title = "", description = "" } = phasesInfo[key];

    if (!title) {
      return json<ErrorData>({
        error: {
          body: `missing title for phase #${key}`,
          status: 400,
        },
      });
    }
    await createPhase(plan.id, title, description);
  }

  return json({
    success: {
      body: "all created!",
      status: 200,
    },
  });
};

const AddPlan = () => {
  const [phases, setPhases] = React.useState(1);

  const increasePhases = () => setPhases(phases + 1);
  const decreasePhases = () => setPhases(phases - 1 < 1 ? 1 : phases - 1);

  const user = useLoaderData<Awaited<ReturnType<typeof getUser>>>();

  const data = useActionData();

  console.log("data", data);

  if (!user) return null;

  return (
    <Layout user={user}>
      <Form method="post" action="/plan/add-plan">
        <Input label="Name of the plan" name="plan-title" required />

        <div className="flex flex-col">
          {new Array(phases).fill(0).map((el, idx) => {
            return (
              <div key={idx} className="flex">
                <Input label="Phase" name={`phase-title-${idx}`} required />
                <div className="inline-block w-4" />
                <Input label="Description" name={`phase-description-${idx}`} />
              </div>
            );
          })}
        </div>

        <div className="flex item-center ">
          <button
            type="button"
            onClick={increasePhases}
            className="btn btn-sm btn-success"
          >
            +
          </button>
          <button
            type="button"
            onClick={decreasePhases}
            className="btn btn-sm btn-error"
          >
            -
          </button>
        </div>
        <div className="h-4" />

        <button type="submit" className="btn btn-primary">
          Create Plan
        </button>
      </Form>
    </Layout>
  );
};

export default AddPlan;
