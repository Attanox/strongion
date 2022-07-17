import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ErrorData } from "types/index.server";

const AuthForm = (props: { formType: "register" | "login" }) => {
  const { formType } = props;

  const data = useActionData<ErrorData>();

  const transition = useTransition();
  const isLoading = Boolean(transition.submission);

  return (
    <section className="h-screen w-screen">
      <div className="container px-6 py-12 mx-auto h-full">
        <div className="flex flex-col justify-center items-center flex-wrap h-full g-6 text-gray-800">
          <h1 className="font-medium leading-tight text-4xl mt-0 mb-2 text-blue-600 capitalize">
            {formType}
          </h1>
          <div className="md:w-8/12 lg:w-5/12 lg:ml-20">
            <Form method="post" action={`/auth/${formType}`}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  placeholder="_andi_"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="form-label inline-block mb-2 text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                  placeholder="Password"
                />
              </div>

              <div className="flex justify-between items-center mb-6">
                {formType === "register" ? (
                  <a
                    href="/auth/login"
                    className="text-blue-600 hover:text-blue-700 focus:text-blue-700 active:text-blue-800 duration-200 transition ease-in-out"
                  >
                    Already have an account?
                  </a>
                ) : (
                  <a
                    href="/auth/register"
                    className="text-blue-600 hover:text-blue-700 focus:text-blue-700 active:text-blue-800 duration-200 transition ease-in-out"
                  >
                    Create an account
                  </a>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-block px-7 py-3 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full"
                data-mdb-ripple="true"
                data-mdb-ripple-color="light"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </Form>
            {data?.error && (
              <div
                className="bg-red-100 rounded-lg py-5 px-6 my-3 text-base text-red-700 inline-flex items-center w-full"
                role="alert"
              >
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
      </div>
    </section>
  );
};

export default AuthForm;
