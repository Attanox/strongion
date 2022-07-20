import React from "react";
import { useCombobox } from "downshift";
import { debounce } from "ts-debounce";
import { searchExercises } from "utils/fetch";
import type { ExerciseSuggestion } from "types/exercise";

const getExerciseFilter =
  (inputValue: string | undefined) => (item: ExerciseSuggestion) => {
    return !inputValue || item.value.includes(inputValue);
  };

const AutoComplete = () => {
  const [items, setItems] = React.useState<ExerciseSuggestion[]>([]);

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
    onInputValueChange: debounce(async ({ inputValue }) => {
      const { suggestions } = await searchExercises(inputValue || "");

      if (!suggestions) setItems([]);
      else setItems(suggestions.filter(getExerciseFilter(inputValue)));
    }, 500),
    items,
    itemToString(item) {
      return item ? item.value : "";
    },
  });

  return (
    <div {...getComboboxProps()} className="form-control w-full max-w-xs">
      <label {...getLabelProps()} className="label label-text">
        Enter a fruit
      </label>
      <input
        {...getInputProps()}
        className="input input-bordered w-full max-w-xs"
      />
      <ul {...getMenuProps()} className="menu bg-base-100 w-56">
        {isOpen
          ? items.map((item, index) => (
              <li
                key={item.value}
                className="w-full max-w-xs"
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
            ))
          : null}
      </ul>
    </div>
  );
};

export default AutoComplete;
