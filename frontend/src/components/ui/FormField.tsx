import { type ReactNode } from "react";
import { Label } from "./Label";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-xs text-zinc-500 mt-1.5">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600 mt-1.5">{error}</p> : null}
    </div>
  );
}
