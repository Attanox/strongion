import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import type { ErrorData } from "types/index.server";

const AuthForm = (props: { formType: "register" | "login" }) => {
  const { formType } = props;

  const data = useActionData<ErrorData>();

  const transition = useTransition();
  const isLoading = Boolean(transition.submission);

  return (
    <section className="h-screen w-screen">
      <div className="container px-6 py-12 mx-auto h-full">
        <div className="flex flex-col justify-center items-center flex-wrap h-full g-6">
          <h1 className="capitalize font-semibold text-3xl">{formType}</h1>
          <Form method="post" action={`/auth/${formType}`} className="w-96">
            <div className="mb-6">
              <label htmlFor="name" className="label ">
                <span className="label-text">Name</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="input input-bordered w-full"
                placeholder="Name"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input input-bordered w-full"
                placeholder="Password"
              />
            </div>

            <div className="flex justify-between items-center mb-6">
              {formType === "register" ? (
                <Link to="/auth/login" className="link">
                  Already have an account?
                </Link>
              ) : (
                <Link to="/auth/register" className="link">
                  Create an account
                </Link>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              data-mdb-ripple="true"
              data-mdb-ripple-color="light"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </Form>
          {data?.error && (
            <div className="alert alert-error shadow-lg w-96 my-3" role="alert">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="times-circle"
                className="w-4 h-4 mr-2 fill-current"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"
                ></path>
              </svg>
              {data.error.body}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AuthForm;
