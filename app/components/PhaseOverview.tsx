import React from "react";
import { type getPlanAndPhases } from "server/plan.server";

type TPhase = Awaited<ReturnType<typeof getPlanAndPhases>>["phases"][0];

const PhaseOverview = (props: { phase: TPhase }) => {
  const { phase } = props;

  return (
    <div className="flex flex-col w-full">
      <h2 className="tracking-wide">{phase.title}</h2>
      <div className="h-4" />
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-primary text-white">
            <tr>
              <th scope="col" className="py-3 px-6">
                Exercise
              </th>
              <th scope="col" className="py-3 px-6">
                Sets
              </th>
              <th scope="col" className="py-3 px-6">
                Reps
              </th>
            </tr>
          </thead>
          <tbody>
            {phase.exercises.map((exercise, index) => {
              const isLastRow = index + 1 === phase.exercises.length;
              return (
                <tr
                  key={exercise.id}
                  className={`bg-white ${
                    isLastRow ? "" : "border-gray-700 border-b"
                  }`}
                >
                  <th
                    scope="row"
                    className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {exercise.name}
                  </th>
                  <td className="py-4 px-6">{exercise.exerciseData.sets}</td>
                  <td className="py-4 px-6">{exercise.exerciseData.reps}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PhaseOverview;
