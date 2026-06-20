// components/DateField.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

interface DateFieldProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  variant: "inline" | "icon";
  label?: string;
  disabled?: boolean;
}

export function DateField({
  value,
  onChange,
  variant,
  label,
  disabled = false,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (selected: Date | undefined) => {
    onChange(selected ?? null);
    setIsOpen(false);
  };

  const formattedValue = value ? format(value, "d MMMM yyyy") : null;

  return (
    <div className="relative flex flex-col gap-1" ref={containerRef}>
      {variant === "inline" && label && (
        <span className="text-xs font-semibold uppercase tracking-wide text-bark/70">{label.toLowerCase()}</span>
      )}

      {variant === "inline" ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
          className="rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-left text-sm text-bark shadow-sm transition-colors hover:border-bark/50 focus:outline-none focus:ring-2 focus:ring-moss disabled:cursor-not-allowed disabled:opacity-50"
        >
          {formattedValue ?? "select a date"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
          aria-label="edit completed date"
          className="rounded-lg border-2 border-bark/30 bg-parchment p-2 text-bark transition-colors hover:border-bark/50 hover:bg-parchment-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="8" y1="3" x2="8" y2="7" />
            <line x1="16" y1="3" x2="16" y2="7" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="absolute z-10 top-full mt-1 rounded-lg border-2 border-bark/30 bg-parchment p-3 shadow-lg">
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}
