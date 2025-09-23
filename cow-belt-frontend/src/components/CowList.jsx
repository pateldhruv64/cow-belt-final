import React from "react";
import CowCard from "./CowCard";

const CowList = ({ cows, onOpen }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {cows.map((cow) => (
        <CowCard key={cow._id} cow={cow} onOpen={onOpen} />
      ))}
    </div>
  );
};

export default CowList;
