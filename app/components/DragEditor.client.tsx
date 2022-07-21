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

const getArray = (count: number, offset = 0) => {
  const arr = Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`,
  }));
  return arr;
};

// fake data generator
const getItems = (count: number, phases: number) => {
  const result = [];
  for (let index = 0; index < phases; index++) {
    result.push(getArray(count, index * count));
  }
  return result;
};

// a little function to help us with reordering the result
const reorder = (
  list: ReturnType<typeof getArray>,
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
  source: ReturnType<typeof getArray>,
  destination: ReturnType<typeof getArray>,
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [k: string]: ReturnType<typeof getArray> } = {};
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

  const [phases, setPhases] = React.useState(
    getItems(10, initialPhases.length)
  );

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    // dropped outside the list

    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const newItems = reorder(phases[sInd], source.index, destination.index);
      const newState = [...phases];
      newState[sInd] = newItems;
      setPhases(newState);
    } else {
      const result = move(phases[sInd], phases[dInd], source, destination);
      const newState = [...phases];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setPhases(newState.filter((group) => group.length));
    }
  };

  return (
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
                      key={exercise.id}
                      draggableId={exercise.id}
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
                        >
                          {exercise.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </DragDropContext>
    </div>
  );
};

export default DragEditor;
