"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-stone-900",
          "placeholder:text-stone-400 transition-colors",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 focus-visible:border-brand-500",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-stone-50",
          error
            ? "border-danger/60 focus-visible:border-danger focus-visible:ring-danger/15"
            : "border-stone-200 hover:border-stone-300",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
