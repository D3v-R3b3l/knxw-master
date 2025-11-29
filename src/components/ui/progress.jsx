import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.floor(clamped)}
      {...props}
    >
      <div
        className="h-full bg-gradient-to-r from-[#00d4ff] to-[#0ea5e9] transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };