import { type LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authenticateUser } from "auth/authenticateUser";
import Layout from "components/Layout";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticateUser(request);

  return user;
};

export default function Index() {
  const user = useLoaderData<Awaited<ReturnType<typeof authenticateUser>>>();

  if (!user) return null;

  return (
    <Layout user={user}>
      <Link to="/plan/add-plan" className="btn btn-sm">
        Create phase
      </Link>
    </Layout>
  );
}
