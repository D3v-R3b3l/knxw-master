import React from "react";
import { useReducedMotion } from "framer-motion";

export default function GooeyOrbs({ className = "" }) {
  const prefersReducedMotion = useReducedMotion();

  // Return null for performance - this component was causing significant lag
  if (prefersReducedMotion) {
    return null;
  }

  // Simplified static version to reduce performance impact
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
    >
      <div className="relative w-[60vw] max-w-[600px] aspect-square opacity-20">
        <div className="absolute inset-0">
          <div className="absolute w-1/3 h-1/3 left-1/4 top-1/4 bg-gradient-to-br from-[#00d4ff]/30 to-transparent rounded-full blur-xl" />
          <div className="absolute w-1/4 h-1/4 right-1/4 top-1/3 bg-gradient-to-br from-[#ec4899]/30 to-transparent rounded-full blur-xl" />
          <div className="absolute w-1/3 h-1/3 left-1/3 bottom-1/4 bg-gradient-to-br from-[#fbbf24]/30 to-transparent rounded-full blur-xl" />
        </div>
      </div>
    </div>
  );
}