import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function LegendPill({ label, className = "", tooltip }) {
  const content = tooltip || String(label).replace(/_/g, " ");
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`capitalize ${className}`} title={content}>
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm leading-relaxed">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}