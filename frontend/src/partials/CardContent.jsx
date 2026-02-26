import { Pencil, Trash } from "lucide-react";
import React from "react";

const CardContent = ({ children, className = "" }) => {
  return <div className={`p-8 ${className}`}>{children}</div>;
};

export default CardContent;
