import type { Plan } from "@prisma/client";
import { Link } from "@remix-run/react";
import React from "react";

const PlanListing = (props: { plans: Plan[] }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {props.plans.map((p) => {
        return (
          <div key={p.id} className="card w-96 bg-primary text-primary-content">
            <div className="card-body">
              <h2 className="card-title">{p.title}</h2>
              <p>{p.description}</p>
              <Link to={`/plan/${p.id}`} className="card-actions justify-end">
                <button className="btn">Edit</button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlanListing;