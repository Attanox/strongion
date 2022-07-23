import type { ExercisesPayload, SearchPayload } from "types/exercise";

const EXERCISE_URL = "https://wger.de/api/v2/exercise/?language=2";
const SEARCH_URL = "https://wger.de/api/v2/exercise/search/?language=2&term=";

async function get<T>(url: string, customConfig = {}): Promise<T> {
  if (!url) {
    return Promise.reject(new Error("No URL given"));
  }
  const config = {
    method: "GET",
    ...customConfig,
  };

  return fetch(url, config)
    .then(async (response) => {
      if (response.ok) {
        return await response.json();
      } else {
        const errorMessage = await response.text();
        return Promise.reject(new Error(errorMessage));
      }
    })
    .catch(function (err) {
      console.error(` Err: ${err}`);
    });
}

export function fetchExercises() {
  return get<ExercisesPayload>(EXERCISE_URL);
}

export function searchExercises(term: string) {
  return get<SearchPayload>(`${SEARCH_URL}${term}`);
}
