// components/DoneItemRow.tsx

import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";

interface Tag {
  id: string;
  name: string;
}

interface DoneItemRowProps {
  id: string;
  text: string;
  tagId: string | null;
  tags: Tag[];
  habiticaSend: boolean | null;
  isSending: boolean;
  sendError: string | null;
  onChange: (id: string, text: string) => void;
  onBlur: (id: string) => void;
  onTagChange: (id: string, tagId: string | null) => void;
  onSend: (id: string) => void;
}

export function DoneItemRow({ id, text, tagId, tags, habiticaSend, isSending, sendError, onChange, onBlur, onTagChange, onSend }: DoneItemRowProps) {
  const tagOptions = [
    { id: "", label: "No tag" },
    ...tags.map((tag) => ({ id: tag.id, label: tag.name })),
  ];

  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-bark/15 bg-parchment/60 p-3 transition-colors hover:bg-parchment-dark/30">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => onChange(id, e.target.value)}
          onBlur={() => onBlur(id)}
          className="flex-1 rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-moss"
        />
        <div className="w-36">
          <Dropdown
            options={tagOptions}
            value={tagId ?? ""}
            onChange={(selectedId) => onTagChange(id, selectedId || null)}
            placeholder="No tag"
          />
        </div>
        {habiticaSend ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-moss px-3 py-2 text-sm font-semibold text-parchment">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            Sent
          </span>
        ) : (
          <Button
            variant="secondary"
            onClick={() => onSend(id)}
            isLoading={isSending}
          >
            Send
          </Button>
        )}
      </div>
      {sendError && (
        <p className="text-xs text-berry">{sendError}</p>
      )}
    </div>
  );
}