import { Pencil, Trash } from "lucide-react";
import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white/5 backdrop-blur-2xl  hover:scale-110 rounded-2xl shadow-2xl border border-white/10 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
