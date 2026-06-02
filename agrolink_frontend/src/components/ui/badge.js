import React from "react";

export function Badge({ children, className = "", variant = "default" }) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  const variants = {
    default: "bg-gray-200 text-gray-800",
    outline: "border border-gray-300 text-gray-800",
    secondary: "bg-gray-100 text-gray-600",
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}
