import * as React from "react";

import type { LoaderFunction } from "@remix-run/node";
import { authenticateUser } from "auth/authenticateUser";
import { useLoaderData } from "@remix-run/react";
import { fetchExercises, searchExercises } from "utils/fetch";

type LoaderData = {
  user: Awaited<ReturnType<typeof authenticateUser>>;
  fetchedExercises: Awaited<ReturnType<typeof fetchExercises>>;
  searchedExercises: Awaited<ReturnType<typeof searchExercises>>;
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const user = await authenticateUser(request);

  const fetchedExercises = await fetchExercises();
  const searchedExercises = await searchExercises("bench");

  return { user, fetchedExercises, searchedExercises };
};

const BuildPlan = () => {
  const { user, fetchedExercises, searchedExercises } =
    useLoaderData<LoaderData>();

  console.log({ fetchedExercises, searchedExercises });

  if (!user) return null;

  return <div>BuildPlan</div>;
};

export default BuildPlan;
