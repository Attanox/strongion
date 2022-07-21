import { type LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authenticateUser } from "auth/authenticateUser";
import Layout from "components/Layout";
import PlanListing from "components/PlanListing";
import { listPlans } from "server/plan.server";

type LoaderData = {
  user: Awaited<ReturnType<typeof authenticateUser>>;
  plans: Awaited<ReturnType<typeof listPlans>>;
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const user = await authenticateUser(request);

  const plans = await listPlans(user.id);

  return { user, plans };
};

export default function Index() {
  const { user, plans } = useLoaderData<LoaderData>();

  if (!user) return null;

  return (
    <Layout user={user}>
      <Link to="/plan/add-plan" className="btn btn-sm">
        Create phase
      </Link>
      <div className="h-4 w-full" />
      <PlanListing plans={plans} />
    </Layout>
  );
}
