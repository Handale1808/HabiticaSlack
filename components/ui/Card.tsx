import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-bark/20 bg-parchment p-6 shadow-sm ring-1 ring-inset ring-parchment-dark/40 ${className}`}
    >
      {children}
    </div>
  );
}