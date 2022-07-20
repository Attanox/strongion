import type { ExercisesPayload, SearchPayload } from "types/exercise";

const EXERCISE_URL = process.env.EXERCISES_URL!;
const SEARCH_URL = process.env.SEARCH_EXERCISE_URL!;

if (!EXERCISE_URL || !SEARCH_URL) {
  throw new Error("no exercise URL defined in .env");
}

async function get<T>(url: string, customConfig = {}): Promise<T> {
  if (!url) {
    return Promise.reject(new Error("No URL given"));
  }
  const config = {
    method: "GET",
    ...customConfig,
  };

  return fetch(url, config).then(async (response) => {
    if (response.ok) {
      return await response.json();
    } else {
      const errorMessage = await response.text();
      return Promise.reject(new Error(errorMessage));
    }
  });
}

export function fetchExercises() {
  return get<ExercisesPayload>(EXERCISE_URL);
}

export function searchExercises(term: string) {
  return get<SearchPayload>(`${SEARCH_URL}${term}`);
}
