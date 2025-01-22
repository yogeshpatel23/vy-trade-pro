"use client";

import { RootState } from "@/store";
import { useSelector } from "react-redux";

const IndexList = () => {
  const indexes = useSelector((store: RootState) => store.indexwatch);
  return (
    <div className="flex gap-2 text-sm fixed md:absolute top-0 h-11">
      {indexes.map((index) => (
        <div
          key={index.token}
          className="border rounded-lg overflow-hidden flex flex-col items-center"
        >
          <span
            className={`${
              parseFloat(index.pc) < 0 ? "bg-red-700" : "bg-green-800"
            } w-full text-center px-2 uppercase`}
          >
            {index.cname}
          </span>
          <span key={index.ltp} className="px-2 animate-in sc">
            {parseFloat(index.ltp).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default IndexList;
