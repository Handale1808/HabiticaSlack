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
        <span className="text-sm text-gray-400">{label}</span>
      )}

      {variant === "inline" ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
          className="border border-gray-700 rounded px-3 py-2 text-sm bg-transparent text-left focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
        >
          {formattedValue ?? "Select a date"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
          aria-label="Edit completed date"
          className="border border-gray-700 rounded p-2 hover:bg-gray-900 transition-colors disabled:opacity-50"
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
        <div className="absolute z-10 top-full mt-1 border border-gray-700 rounded bg-black p-2 shadow-lg">
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
