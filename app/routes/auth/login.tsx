import {
  type ActionFunction,
  type LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import AuthForm from "components/AuthForm";
import { login } from "server/auth.server";
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
        body: "Missing values",
      },
    });
  }

  if (typeof name !== "string" || typeof password !== "string") {
    throw new Error(`Form not submitted correctly.`);
  }

  const user = await login({ name, password });
  return user;
};

const LoginForm = () => {
  return <AuthForm formType="login" />;
};

export default LoginForm;
