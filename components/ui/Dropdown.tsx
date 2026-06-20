"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

interface DropdownOption {
  id: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TYPEAHEAD_RESET_MS = 600;

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
}: DropdownProps) {
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const typeaheadRef = useRef<string>("");
  const typeaheadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedIndex = options.findIndex((option) => option.id === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

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

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const openListbox = (startIndex: number) => {
    setIsOpen(true);
    setActiveIndex(startIndex);
  };

  const closeListbox = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const commitSelection = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.id);
    closeListbox();
  };

  const moveActiveIndex = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(options.length - 1, nextIndex));
    setActiveIndex(clamped);
  };

  const handleTypeahead = (char: string) => {
    if (typeaheadTimeoutRef.current) {
      clearTimeout(typeaheadTimeoutRef.current);
    }
    typeaheadRef.current += char.toLowerCase();
    const buffer = typeaheadRef.current;

    const match = options.findIndex((option) =>
      option.label.toLowerCase().startsWith(buffer),
    );

    if (match >= 0) {
      if (isOpen) {
        setActiveIndex(match);
      } else {
        onChange(options[match].id);
      }
    }

    typeaheadTimeoutRef.current = setTimeout(() => {
      typeaheadRef.current = "";
    }, TYPEAHEAD_RESET_MS);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openListbox(selectedIndex >= 0 ? selectedIndex : 0);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        openListbox(options.length - 1);
        return;
      }
      if (event.key.length === 1 && event.key !== " ") {
        handleTypeahead(event.key);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActiveIndex(activeIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActiveIndex(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        moveActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        moveActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (activeIndex >= 0) commitSelection(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        closeListbox();
        break;
      case "Tab":
        if (activeIndex >= 0) commitSelection(activeIndex);
        break;
      default:
        if (event.key.length === 1) handleTypeahead(event.key);
    }
  };

  const activeOptionId =
    isOpen && activeIndex >= 0 ? `${baseId}-option-${activeIndex}` : undefined;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        disabled={disabled}
        onClick={() =>
          isOpen ? closeListbox() : openListbox(selectedIndex >= 0 ? selectedIndex : 0)
        }
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between gap-2 rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-left text-sm text-bark shadow-sm transition-colors hover:border-bark/50 focus:outline-none focus:ring-2 focus:ring-moss disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selectedOption ? "text-bark" : "text-bark/50"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span aria-hidden="true" className="text-bark/50">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={placeholder}
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border-2 border-bark/30 bg-parchment py-1 shadow-lg"
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-bark/50">No options yet</li>
          )}
          {options.map((option, index) => (
            <li
              key={option.id}
              id={`${baseId}-option-${index}`}
              role="option"
              aria-selected={option.id === value}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commitSelection(index)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === activeIndex
                  ? "bg-moss text-parchment"
                  : "text-bark hover:bg-parchment-dark"
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}