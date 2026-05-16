"use client";

import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-2xs font-semibold uppercase tracking-eyebrow text-stone-500 mb-2",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";
