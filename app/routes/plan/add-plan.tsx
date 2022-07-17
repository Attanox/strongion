import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { getUser } from "server/user.server";
import Layout from "components/Layout";

const Input = (props: { label: string; name: string }) => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">{props.label}</span>
      </label>
      <input
        type="text"
        id={props.name}
        name={props.name}
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

  // 1. create a plan with author id of user

  // 2. create phases with plan id of created plan

  for (const pair of formData.entries()) {
    const key = pair[0];
    const value = pair[1];
  }

  return null;
};

const AddPlan = () => {
  const [phases, setPhases] = React.useState(1);

  const increasePhases = () => setPhases(phases + 1);
  const decreasePhases = () => setPhases(phases - 1 < 1 ? 1 : phases - 1);

  const user = useLoaderData<Awaited<ReturnType<typeof getUser>>>();

  if (!user) return null;

  return (
    <Layout user={user}>
      <Form method="post" action="/plan/add-plan">
        <Input label="Name of the plan" name="planTitle" />

        <div className="flex flex-col">
          {new Array(phases).fill(0).map((el, idx) => {
            return (
              <div key={idx} className="flex">
                <Input label="Phase" name={`phaseTitle-${idx}`} />
                <div className="inline-block w-4" />
                <Input label="Description" name={`phaseDescription-${idx}`} />
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
