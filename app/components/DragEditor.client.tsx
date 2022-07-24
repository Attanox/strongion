import React from "react";
import type { Phase, Plan } from "@prisma/client";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggingStyle,
  type NotDraggingStyle,
  type DropResult,
  type ResponderProvided,
  type DraggableLocation,
} from "react-beautiful-dnd";
import type { ExerciseSuggestion } from "types/exercise";
import AutoComplete from "./AutoComplete.client";
import { Form } from "@remix-run/react";

const getItems = (phases: number) => {
  const result = [];
  for (let index = 0; index < phases; index++) {
    result.push([]);
  }
  return result;
};

// a little function to help us with reordering the result
const reorder = (
  list: ExerciseSuggestion[],
  startIndex: number,
  endIndex: number
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (
  source: ExerciseSuggestion[],
  destination: ExerciseSuggestion[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [k: string]: ExerciseSuggestion[] } = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 250,
});

const getItemStyle = (
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined
): React.CSSProperties => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const DragEditor = (props: { plan: Plan; phases: Phase[] }) => {
  const { phases: initialPhases } = props;

  const [phases, setPhases] = React.useState<ExerciseSuggestion[][]>(
    getItems(initialPhases.length)
  );

  const [searchedExercises, setSearchedExercises] = React.useState<
    ExerciseSuggestion[]
  >([]);

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

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
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

  return (
    <Form method="post">
      <div className="w-full flex flex-col">
        <div className="flex w-full items-center justify-between">
          <AutoComplete
            setSearchedExercises={(e) => {
              const newlyAdded = [{ ...e[0], info: { sets: 0, reps: 0 } }];
              setSearchedExercises((prevStat) => [...prevStat, ...newlyAdded]);
            }}
          />
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
        <div className="w-full h-4" />

        <div className="flex flex-row justify-between">
          <DragDropContext onDragEnd={onDragEnd}>
            {phases.map((phase, idx) => {
              return (
                <Droppable key={idx} droppableId={`${idx}`}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                    >
                      {phase.map((exercise, index) => (
                        <Draggable
                          key={exercise.data.id}
                          draggableId={String(exercise.data.id)}
                          index={index}
                        >
                          {(provided, snapshot) => {
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                )}
                                className="w-full flex flex-col justify-center items-start"
                                key={`${exercise.info.sets}-${exercise.info.reps}`}
                              >
                                <span>{exercise.value}</span>
                                <input
                                  name={`phase[${idx}][${exercise.data.id}][title]`}
                                  defaultValue={exercise.value}
                                  className="hidden"
                                />
                                <div className="flex items-center">
                                  <input
                                    name={`phase[${idx}][${exercise.data.id}][sets]`}
                                    type="number"
                                    defaultValue={exercise.info.sets}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);

                                      changeSetsAndReps(
                                        value,
                                        "sets",
                                        idx,
                                        index
                                      );
                                    }}
                                    className="input input-bordered w-full h-8"
                                  />
                                  <span className="mx-4">X</span>
                                  <input
                                    name={`phase[${idx}][${exercise.data.id}][reps]`}
                                    type="number"
                                    defaultValue={exercise.info.reps}
                                    onChange={(e) => {
                                      const value = Number(e.target.value);

                                      changeSetsAndReps(
                                        value,
                                        "reps",
                                        idx,
                                        index
                                      );
                                    }}
                                    className="input input-bordered w-full h-8"
                                  />
                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
            <Droppable droppableId={`${phases.length}`}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {searchedExercises.map((exercise, index) => (
                    <Draggable
                      key={exercise.data.id}
                      draggableId={String(exercise.data.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                          className="w-full flex flex-col justify-center items-start"
                        >
                          <span>{exercise.value}</span>
                          <div className="flex items-center">
                            <input
                              name="sets"
                              type="number"
                              defaultValue={exercise.info.sets}
                              onChange={(e) => {
                                const value = Number(e.target.value);

                                changeSetsAndReps(
                                  value,
                                  "sets",
                                  phases.length,
                                  index
                                );
                              }}
                              className="input input-bordered w-full h-8"
                            />
                            <span className="mx-4">X</span>
                            <input
                              name="reps"
                              type="number"
                              defaultValue={exercise.info.reps}
                              onChange={(e) => {
                                const value = Number(e.target.value);

                                changeSetsAndReps(
                                  value,
                                  "reps",
                                  phases.length,
                                  index
                                );
                              }}
                              className="input input-bordered w-full h-8"
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </Form>
  );
};

export default DragEditor;
