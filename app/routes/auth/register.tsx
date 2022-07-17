import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import AuthForm from "components/AuthForm";
import { registerUser } from "server/auth.server";
import { getUser } from "server/user.server";
import type { ErrorData } from "types/index.server";

export const loader: LoaderFunction = async ({ request }) => {
  // If user has active session, redirect to the homepage
  return (await getUser(request)) ? redirect("/") : null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const name = formData.get("name");
  const password = formData.get("password");

  if (!name || !password) {
    return json<ErrorData>({
      error: {
        status: 400,
        body: "Please provide name and password",
      },
    });
  }

  if (typeof name !== "string" || typeof password !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }

  const user = await registerUser({ name, password });
  return user;
};

const RegisterForm = () => {
  return <AuthForm formType="register" />;
};

export default RegisterForm;
