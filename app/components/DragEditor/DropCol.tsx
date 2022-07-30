import { Draggable, Droppable } from "react-beautiful-dnd";
import type { DndExercise } from "./types";
import { getItemStyle, getListStyle } from "./utils";

const DropCol = (props: {
  id: string;
  draggables: DndExercise[];
  onClick: (a: number) => void;
  renderInputRow: (e: DndExercise, idx: number) => React.ReactNode;
  bgClass: string;
}) => {
  const { draggables, id, onClick, renderInputRow, bgClass } = props;

  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          style={getListStyle()}
          className={bgClass}
        >
          {draggables.map((exercise, index) => (
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
                  className={`bg-base-100 w-full flex flex-col justify-center items-start`}
                >
                  <div className="w-full flex justify-between items-center">
                    <span>{exercise.name}</span>
                    <div className="w-4" />
                    <button
                      onClick={() => onClick(index)}
                      className="btn btn-square btn-sm btn-outline fill-primary"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="h-4" />
                  {renderInputRow(exercise, index)}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default DropCol;
