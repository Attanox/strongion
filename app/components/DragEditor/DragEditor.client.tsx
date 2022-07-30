import React from "react";
import type { Plan } from "@prisma/client";
import { DragDropContext, type DropResult } from "react-beautiful-dnd";
import AutoComplete from "components/AutoComplete.client";
import { Form } from "@remix-run/react";
import type { DndExercise, TPhases } from "./types";
import { getItems, move, reorder } from "./utils";
import DropCol from "./DropCol";

const DragEditor = (props: { plan: Plan; phases: TPhases }) => {
  const { phases: initialPhases } = props;

  const [phases, setPhases] = React.useState<DndExercise[][]>(
    getItems(initialPhases)
  );

  const [searchedExercises, setSearchedExercises] = React.useState<
    DndExercise[]
  >([]);

  const inFocus = React.useRef<HTMLInputElement>();

  const changeSetsAndReps = (
    value: number,
    what: "sets" | "reps",
    whichCol: number,
    whichRow: number
  ) => {
    if (whichCol === phases.length) {
      const copied = [...searchedExercises];
      copied[whichRow] = {
        ...copied[whichRow],
        info: {
          ...copied[whichRow]["info"],
          [what]: value,
        },
      };
      setSearchedExercises(copied);
    } else {
      const copied = [...phases];
      copied[whichCol][whichRow] = {
        ...copied[whichCol][whichRow],
        info: {
          ...copied[whichCol][whichRow]["info"],
          [what]: value,
        },
      };
      setPhases(copied);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      if (sInd === phases.length) {
        const newItems = reorder(
          searchedExercises,
          source.index,
          destination.index
        );
        setSearchedExercises(newItems);
      } else {
        const newItems = reorder(phases[sInd], source.index, destination.index);
        const newState = [...phases];
        newState[sInd] = newItems;
        setPhases(newState);
      }
    } else {
      if (sInd === phases.length) {
        const result = move(
          searchedExercises,
          phases[dInd],
          source,
          destination
        );
        const newState = [...phases];
        newState[dInd] = result[dInd];
        setPhases(newState);
        const newSearchedExercises = result[sInd];
        setSearchedExercises(newSearchedExercises);
      } else if (dInd === phases.length) {
        const result = move(
          phases[sInd],
          searchedExercises,
          source,
          destination
        );
        const newState = [...phases];
        newState[sInd] = result[sInd];
        setPhases(newState);
        const newSearchedExercises = result[dInd];
        setSearchedExercises(newSearchedExercises);
      } else {
        const result = move(phases[sInd], phases[dInd], source, destination);
        const newState = [...phases];
        newState[sInd] = result[sInd];
        newState[dInd] = result[dInd];
        setPhases(newState);
      }
    }
  };

  const removeExercise = (phaseIdx: number, exerciseIdx: number) => {
    const newPhases = [...phases];

    newPhases[phaseIdx].splice(exerciseIdx, 1);

    setPhases(newPhases);
  };

  const removeSearched = (exerciseIdx: number) => {
    const newSearched = [...searchedExercises];

    newSearched.splice(exerciseIdx, 1);

    setSearchedExercises(newSearched);
  };

  return (
    <Form method="post">
      <div className="w-full flex flex-col">
        <div className="flex w-full items-center justify-between">
          <AutoComplete
            setSearchedExercises={(e) => {
              const newlyAdded: DndExercise[] = [
                {
                  name: e[0].value,
                  id: String(e[0].data.id),
                  info: { sets: 0, reps: 0 },
                },
              ];
              setSearchedExercises((prevStat) => [...prevStat, ...newlyAdded]);
            }}
          />
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
        <div className="w-full h-4" />

        <div className="flex flex-row justify-between">
          <DragDropContext
            onBeforeDragStart={() => inFocus.current?.blur()}
            onDragEnd={onDragEnd}
          >
            {phases.map((phase, idx) => {
              return (
                <DropCol
                  key={idx}
                  id={`${idx}`}
                  bgClass={`bg-primary`}
                  renderInputRow={(exercise, index) => {
                    return (
                      <React.Fragment>
                        <input
                          name={`phase[${idx}][${exercise.id}][title]`}
                          defaultValue={exercise.name}
                          className="hidden"
                        />
                        <div className="flex items-center">
                          <input
                            name={`phase[${idx}][${exercise.id}][sets]`}
                            type="number"
                            defaultValue={exercise.info.sets}
                            onBlur={(e) => {
                              const value = Number(e.target.value);

                              changeSetsAndReps(value, "sets", idx, index);
                            }}
                            onFocus={(e) => (inFocus.current = e.target)}
                            className="input input-bordered w-full h-8"
                          />
                          <span className="mx-4">X</span>
                          <input
                            name={`phase[${idx}][${exercise.id}][reps]`}
                            type="number"
                            defaultValue={exercise.info.reps}
                            onBlur={(e) => {
                              const value = Number(e.target.value);

                              changeSetsAndReps(value, "reps", idx, index);
                            }}
                            onFocus={(e) => (inFocus.current = e.target)}
                            className="input input-bordered w-full h-8"
                          />
                        </div>
                      </React.Fragment>
                    );
                  }}
                  draggables={phase}
                  onClick={(index) => removeExercise(idx, index)}
                />
              );
            })}
            <DropCol
              draggables={searchedExercises}
              id={`${phases.length}`}
              bgClass={`bg-base-300`}
              onClick={(index) => removeSearched(index)}
              renderInputRow={(exercise, index) => {
                return (
                  <div className="flex items-center">
                    <input
                      name="sets"
                      type="number"
                      defaultValue={exercise.info.sets}
                      onBlur={(e) => {
                        const value = Number(e.target.value);

                        changeSetsAndReps(value, "sets", phases.length, index);
                      }}
                      onFocus={(e) => (inFocus.current = e.target)}
                      className="input input-bordered w-full h-8"
                    />
                    <span className="mx-4">X</span>
                    <input
                      name="reps"
                      type="number"
                      defaultValue={exercise.info.reps}
                      onBlur={(e) => {
                        const value = Number(e.target.value);

                        changeSetsAndReps(value, "reps", phases.length, index);
                      }}
                      onFocus={(e) => (inFocus.current = e.target)}
                      className="input input-bordered w-full h-8"
                    />
                  </div>
                );
              }}
            />
          </DragDropContext>
        </div>
      </div>
    </Form>
  );
};

export default DragEditor;
