import React from "react";
import { useCombobox, type UseComboboxStateChange } from "downshift";
import { debounce } from "ts-debounce";
import { searchExercises } from "utils/fetch";
import type { ExerciseSuggestion } from "types/exercise";

const NO_OPTIONS_OPT = {
  value: "NO_OPTIONS",
  data: {
    id: 0,
    name: "NO_OPTIONS",
    category: "",
    image: null,
    image_thumbnail: null,
  },
  info: { sets: 0, reps: 0 },
};

const getExerciseFilter =
  (inputValue: string | undefined) => (item: ExerciseSuggestion) => {
    return !inputValue || item.value.includes(inputValue);
  };

const AutoComplete = (props: {
  setSearchedExercises: (r: ExerciseSuggestion[]) => void;
}) => {
  const { setSearchedExercises } = props;

  const [items, setItems] = React.useState<ExerciseSuggestion[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onInputValueChange = React.useCallback(
    debounce(
      async ({ inputValue }: UseComboboxStateChange<ExerciseSuggestion>) => {
        const { suggestions } = await searchExercises(inputValue || "");

        if (!suggestions || !suggestions.length) {
          setItems([NO_OPTIONS_OPT]);
        } else {
          const filteredExercises = suggestions.filter(
            getExerciseFilter(inputValue)
          );
          setItems(filteredExercises);
        }
      },
      1000
    ),
    []
  );

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    onInputValueChange,
    items,
    itemToString(item) {
      return item ? item.value : "";
    },
    onSelectedItemChange(changes) {
      const exercise = changes.selectedItem;
      if (exercise) setSearchedExercises([exercise]);
    },
  });

  return (
    <div
      {...getComboboxProps()}
      className="form-control relative w-72 flex flex-col gap-1"
    >
      <label {...getLabelProps()} className="label label-text">
        Search for exercise
      </label>
      <input {...getInputProps()} className="input input-bordered w-full" />
      <ul
        {...getMenuProps()}
        key={isOpen}
        className="absolute top-24 w-72 bg-white shadow-md max-h-80 overflow-y-auto"
      >
        {isOpen
          ? items.map((item, index) => {
              if (item.value === NO_OPTIONS_OPT.value) {
                return <li className="w-full">No results...</li>;
              }

              return (
                <li
                  key={item.value}
                  className="w-full cursor-pointer"
                  {...getItemProps({
                    key: item.value,
                    index,
                    item,
                    style: {
                      backgroundColor:
                        highlightedIndex === index ? "lightgray" : "white",
                      fontWeight: selectedItem === item ? "bold" : "normal",
                    },
                  })}
                >
                  {item.value}
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
};

export default AutoComplete;
