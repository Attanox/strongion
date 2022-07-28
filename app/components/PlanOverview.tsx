import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";
import React from "react";
import { type getPlanAndPhases } from "server/plan.server";
import PhaseOverview from "./PhaseOverview";

type TPhases = Awaited<ReturnType<typeof getPlanAndPhases>>["phases"];

const PlanOverview = (props: { phases: TPhases; planTitle: string }) => {
  const { phases, planTitle } = props;

  const exportPDF = () => {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(14);

    const head = [["Exercise name", "Sets", "Reps"]];

    phases.forEach((p) => {
      const finalY = (doc as any).lastAutoTable.finalY || 25;
      const body = p.exercises.map((e) => [
        e.name,
        String(e.exerciseData.sets),
        String(e.exerciseData.reps),
      ]);
      doc.text(p.title, marginLeft, finalY + 40);
      autoTable(doc, {
        head,
        body,
        headStyles: {
          fillColor: 0,
        },
        startY: finalY + 50,
      });
    });

    doc.save(`${planTitle}.pdf`);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex w-full justify-between items-center">
        <h2 className="tracking-wide">{planTitle}</h2>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={exportPDF}
        >
          export
        </button>
      </div>
      <div className="h-8" />

      {phases.map((phase) => {
        return (
          <React.Fragment key={phase.id}>
            <PhaseOverview phase={phase} />
            <div className="w-full h-8" />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default PlanOverview;
