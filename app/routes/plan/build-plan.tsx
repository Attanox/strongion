import type { LoaderFunction } from "@remix-run/node";
import { authenticateUser } from "auth/authenticateUser";
import { useLoaderData } from "@remix-run/react";
import AutoComplete from "components/AutoComplete.client";
import { ClientOnly } from "remix-utils";

type LoaderData = {
  user: Awaited<ReturnType<typeof authenticateUser>>;
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const user = await authenticateUser(request);

  return { user };
};

const BuildPlan = () => {
  const { user } = useLoaderData<LoaderData>();

  if (!user) return null;

  return (
    <div className="flex flex-col px-4">
      <h1>BuildPlan</h1>
      <div className="h-4" />
      <ClientOnly fallback={<div>Loading...</div>}>
        {() => <AutoComplete />}
      </ClientOnly>
    </div>
  );
};

export default BuildPlan;
