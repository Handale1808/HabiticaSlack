import { ReactNode } from "react";

interface FieldLabelProps {
  label?: string;
  error?: string | null;
  children: ReactNode;
}

export function FieldLabel({ label, error, children }: FieldLabelProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide text-bark/70">
          {label}
        </span>
      )}
      {children}
      {error && <p className="text-xs text-berry">{error}</p>}
    </div>
  );
}