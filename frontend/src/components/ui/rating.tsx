"use client";

import { cn } from "@lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  value?: number | null;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function Rating({
  value,
  onChange,
  max = 5,
  size = "md",
  disabled = false,
  showValue = false,
  className,
}: RatingProps) {
  const v = value ?? 0;
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {stars.map((star) => {
        const filled = star <= Math.floor(v);
        const halfFilled = !filled && star - 0.5 <= v;

        return (
          <button
            key={star}
            type="button"
            disabled={disabled || !onChange}
            onClick={() => onChange?.(star)}
            className={cn(
              "transition-colors",
              !disabled && onChange && "cursor-pointer hover:scale-110",
              disabled && "cursor-default"
            )}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeMap[size],
                "transition-all",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : halfFilled
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-none text-muted-foreground/30"
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="mr-2 text-sm text-muted-foreground">
          {v.toFixed(1)}
        </span>
      )}
    </div>
  );
}
