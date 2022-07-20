export type Exercise = {
  id: number;
  uuid: string;
  name: string;
  exercise_base: number;
  description: string;
  creation_date: string;
  category: number;
  muscles: number[];
  muscles_secondary: number[];
  equipment: number[];
  language: number;
  license: number;
  license_author: string;
  variations: number[];
};

export type ExercisesPayload = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Exercise[];
};

export type ExerciseSuggestion = {
  value: string;
  data: {
    id: number;
    name: string;
    category: string;
    image: string | null;
    image_thumbnail: string | null;
  };
};

export type SearchPayload = {
  suggestions: ExerciseSuggestion[];
};
