import { EnrichedItem } from "@/hooks/useSlackSend";

interface SlackPreviewProps {
  enrichedItems: EnrichedItem[];
  summary: string;
  availableCategories: string[];
  onCategoryChange: (id: string, category: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSending: boolean;
  sendError: string | null;
}

import { useState } from "react";

interface CategoryComboboxProps {
  value: string;
  availableCategories: string[];
  onChange: (value: string) => void;
}

function CategoryCombobox({
  value,
  availableCategories,
  onChange,
}: CategoryComboboxProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const filtered = availableCategories
    .filter((cat) => cat.toLowerCase().includes(inputValue.toLowerCase()))
    .slice(0, 6);

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          setTimeout(() => {
            setIsOpen(false);
            onChange(inputValue);
          }, 150);
        }}
        className="border border-gray-700 rounded px-2 py-1 text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500 w-40"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 top-full left-0 mt-1 w-full border border-gray-700 rounded bg-black">
          {filtered.map((cat) => (
            <li
              key={cat}
              onMouseDown={() => {
                setInputValue(cat);
                setIsOpen(false);
                onChange(cat);
              }}
              className="px-2 py-1 text-xs cursor-pointer hover:bg-gray-900"
            >
              {cat}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SlackPreview({
  enrichedItems,
  summary,
  availableCategories,
  onCategoryChange,
  onConfirm,
  onCancel,
  isSending,
  sendError,
}: SlackPreviewProps) {
  const grouped = enrichedItems.reduce<Record<string, EnrichedItem[]>>(
    (acc, item) => {
      const key = item.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-col gap-4 border border-gray-700 rounded p-4 mt-2">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{category}</p>
          {categoryItems.map((item) => (
            <div key={item.id} className="flex gap-2 items-start">
              <p className="flex-1 text-sm text-gray-300">{item.slack_text}</p>
              <CategoryCombobox
                value={item.category}
                availableCategories={availableCategories}
                onChange={(val) => onCategoryChange(item.id, val)}
              />
            </div>
          ))}
        </div>
      ))}

      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-400">{summary}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={isSending}
          className="bg-black text-white border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
        >
          {isSending ? "Sending..." : "Confirm and send"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSending}
          className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
        >
          Cancel
        </button>
      </div>

      {sendError && <p className="text-red-500 text-xs">{sendError}</p>}
    </div>
  );
}
