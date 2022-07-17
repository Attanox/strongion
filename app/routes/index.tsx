import { type LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import Layout from "components/Layout";
import { getUser } from "server/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  if (!user) return redirect("auth/login");

  return user;
};

export default function Index() {
  const user = useLoaderData<Awaited<ReturnType<typeof getUser>>>();

  if (!user) return null;

  return (
    <Layout user={user}>
      <Link to="/plan/add-plan" className="btn btn-sm">
        Create phase
      </Link>
    </Layout>
  );
}
