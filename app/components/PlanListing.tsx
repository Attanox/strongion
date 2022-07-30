import type { Plan } from "@prisma/client";
import { Link } from "@remix-run/react";
import React from "react";

const PlanListing = (props: { plans: Plan[] }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {props.plans.map((p) => {
        return (
          <div key={p.id} className="card bg-primary text-primary-content">
            <div className="card-body">
              <h2 className="card-title">{p.title}</h2>
              <p>{p.description}</p>
              <div className="flex items-center justify-end">
                <Link to={`/plan/${p.id}`} className="card-actions justify-end">
                  <button className="btn">Show</button>
                </Link>
                <div className="w-2" />
                <Link
                  to={`/plan/${p.id}/edit`}
                  className="card-actions justify-end"
                >
                  <button className="btn">Edit</button>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlanListing;
