import { EnrichedItem } from "@/hooks/useSlackSend";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface SlackPreviewProps {
  enrichedItems: EnrichedItem[];
  done: string;
  next: string;
  blocked: string;
  availableCategories: string[];
  onCategoryChange: (id: string, category: string) => void;
  onDoneChange: (value: string) => void;
  onNextChange: (value: string) => void;
  onBlockedChange: (value: string) => void;
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
        className="w-40 rounded-lg border-2 border-bark/30 bg-parchment px-2 py-1 text-xs text-bark shadow-sm focus:outline-none focus:ring-2 focus:ring-moss"
      />
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-10 top-full left-0 mt-1 w-full rounded-lg border-2 border-bark/30 bg-parchment shadow-lg">
          {filtered.map((cat) => (
            <li
              key={cat}
              onMouseDown={() => {
                setInputValue(cat);
                setIsOpen(false);
                onChange(cat);
              }}
              className="cursor-pointer px-2 py-1 text-xs text-bark hover:bg-parchment-dark"
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
  done,
  next,
  blocked,
  availableCategories,
  onCategoryChange,
  onDoneChange,
  onNextChange,
  onBlockedChange,
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
    <Card className="mt-2 flex flex-col gap-4">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-bark">{category}</p>
          {categoryItems.map((item) => (
            <div key={item.id} className="flex items-start gap-2">
              <p className="flex-1 text-sm text-bark/80">{item.slack_text}</p>
              <CategoryCombobox
                value={item.category}
                availableCategories={availableCategories}
                onChange={(val) => onCategoryChange(item.id, val)}
              />
            </div>
          ))}
        </div>
      ))}

      <div className="border-t border-bark/15 pt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-bark/60">Done</label>
          <textarea
            value={done}
            onChange={(e) => onDoneChange(e.target.value)}
            rows={3}
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm focus:outline-none focus:ring-2 focus:ring-moss resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-bark/60">Next</label>
          <textarea
            value={next}
            onChange={(e) => onNextChange(e.target.value)}
            rows={2}
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm focus:outline-none focus:ring-2 focus:ring-moss resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-bark/60">Blocked</label>
          <textarea
            value={blocked}
            onChange={(e) => onBlockedChange(e.target.value)}
            rows={2}
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm focus:outline-none focus:ring-2 focus:ring-moss resize-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onConfirm} isLoading={isSending}>
          Confirm and send to Slack
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={isSending}>
          Cancel
        </Button>
      </div>

      {sendError && <p className="text-xs text-berry">{sendError}</p>}
    </Card>
  );
}
