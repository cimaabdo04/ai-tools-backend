"use client";

import * as React from "react";
import { cn } from "@lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export function Tooltip({
  children,
  content,
  side = "top",
  delay = 300,
  className,
}: TooltipProps) {
  const [show, setShow] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined as unknown as ReturnType<typeof setTimeout>);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  const sideStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && (
        <div
          className={cn(
            "absolute z-50 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md border whitespace-nowrap animate-fade-in pointer-events-none",
            sideStyles[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
