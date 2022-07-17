import { type LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Navbar from "components/Navbar";
import { getUser } from "server/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  console.log(user);

  if (!user) return redirect("auth/login");

  return user;
};

export default function Index() {
  const user = useLoaderData<Awaited<ReturnType<typeof getUser>>>();

  if (!user) return null;

  return (
    <>
      <Navbar user={user} />
      <div className="h-full bg-slate-700 flex justify-center items-center">
        <h2 className="text-blue-600 font-extrabold text-5xl">
          TailwindCSS Is Working!
        </h2>
      </div>
    </>
  );
}
