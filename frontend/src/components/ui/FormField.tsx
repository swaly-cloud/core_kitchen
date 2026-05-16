import { type ReactNode } from "react";
import { Label } from "./Label";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
  optional?: boolean;
}

export function FormField({ id, label, error, hint, optional, children }: FormFieldProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {optional && (
          <span className="text-2xs text-stone-400 font-medium">optional</span>
        )}
      </div>
      {children}
      {hint && !error ? (
        <p className="text-xs text-stone-500 mt-1.5">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-danger mt-1.5">{error}</p> : null}
    </div>
  );
}
