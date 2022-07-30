import type { DndExercise, TPhases } from "./types";
import {
  type DraggingStyle,
  type NotDraggingStyle,
  type DraggableLocation,
} from "react-beautiful-dnd";

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

export { getItems, reorder, move, grid, getListStyle, getItemStyle };
