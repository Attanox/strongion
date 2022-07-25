import React from "react";
import type { Plan } from "@prisma/client";
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
import AutoComplete from "./AutoComplete.client";
import { Form } from "@remix-run/react";
import { type getPlanAndPhases } from "server/plan.server";

type TPhases = Awaited<ReturnType<typeof getPlanAndPhases>>["phases"];

type DndExercise = {
  name: string;
  id: string;
  info: {
    reps: number;
    sets: number;
  };
};

const getItems = (phases: TPhases) => {
  const result = [];
  for (let index = 0; index < phases.length; index++) {
    const phase = phases[index];
    const exercises = phase.exercises.map((el) => ({
      name: el.name,
      id: el.id,
      info: { reps: el.exerciseData.reps, sets: el.exerciseData.sets },
    }));
    result.push([...exercises]);
  }
  return result;
};

// a little function to help us with reordering the result
const reorder = (list: DndExercise[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (
  source: DndExercise[],
  destination: DndExercise[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [k: string]: DndExercise[] } = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;

const getListStyle = () => ({
  padding: grid,
  width: 250,
});

const getItemStyle = (
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined
): React.CSSProperties => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // styles we need to apply on draggables
  ...draggableStyle,
});

const DragEditor = (props: { plan: Plan; phases: TPhases }) => {
  const { phases: initialPhases } = props;

  const [phases, setPhases] = React.useState<DndExercise[][]>(
    getItems(initialPhases)
  );

  const [searchedExercises, setSearchedExercises] = React.useState<
    DndExercise[]
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
          <DragDropContext onDragEnd={onDragEnd}>
            {phases.map((phase, idx) => {
              return (
                <Droppable key={idx} droppableId={`${idx}`}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={getListStyle()}
                      className={`bg-primary`}
                    >
                      {phase.map((exercise, index) => (
                        <Draggable
                          key={exercise.id}
                          draggableId={exercise.id}
                          index={index}
                        >
                          {(provided, snapshot) => {
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                  provided.draggableProps.style
                                )}
                                className={`w-full flex flex-col justify-center items-start bg-base-100`}
                                key={`${exercise.info.sets}-${exercise.info.reps}`}
                              >
                                <span>{exercise.name}</span>
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
                                    name={`phase[${idx}][${exercise.id}][reps]`}
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
                  style={getListStyle()}
                  className={`bg-primary`}
                >
                  {searchedExercises.map((exercise, index) => (
                    <Draggable
                      key={exercise.id}
                      draggableId={exercise.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(provided.draggableProps.style)}
                          className={`w-full flex flex-col justify-center items-start bg-base-100`}
                        >
                          <span>{exercise.name}</span>
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
