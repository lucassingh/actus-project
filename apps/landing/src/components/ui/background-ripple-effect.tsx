"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundRippleEffect = React.memo(function BackgroundRippleEffect({
  className,
  cellClassName,
}: {
  className?: string;
  cellClassName?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 grid [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className
      )}
    >
      {Array.from({ length: 12 }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex w-full justify-center"
        >
          {Array.from({ length: 24 }).map((_, colIdx) => (
            <div
              key={`col-${colIdx}`}
              className={cn(
                "h-12 w-12 shrink-0 rounded-full bg-slate-900/5 dark:bg-slate-100/5",
                "animate-pulse", // Using animate-pulse as a safe fallback
                cellClassName
              )}
              style={{
                animationDelay: `${((rowIdx * 13 + colIdx * 7) % 50) / 10}s`,
                width: `48px`,
                height: `48px`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
});
