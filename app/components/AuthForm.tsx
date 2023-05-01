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
                defaultValue={formType === "login" ? "Test" : ""}
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
                defaultValue={formType === "login" ? "1234" : ""}
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
              {data.error.body}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AuthForm;
