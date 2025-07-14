import React from "react";
import { specialityData } from "@/assets/assets";

export default function SpecialityMenu() {
  return (
    <div
      className="flex flex-col items-center gap-4 py-16 text-gray-800"
      id="speciality"
    >
      <h1 className="text-3xl font-medium">Explore Topics on Smoking Cessation</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Discover key areas affected by smoking and get the right support to quit smoking effectively.
      </p>
      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">
        {specialityData.map((items, index) => (
          <div
            className="flex flex-col items-center text-xs flex-shrink-0"
            key={index}
          >
            <img className="w-16 sm:w-24 mb-2" src={items.image} alt="" />
            <p>{items.speciality}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
