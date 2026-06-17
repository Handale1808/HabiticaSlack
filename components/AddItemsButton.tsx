"use client";

import { useState } from "react";
import { useAddItems } from "@/hooks/useAddItems";

interface Tag {
  id: string;
  name: string;
}

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
}

interface AddItemsButtonProps {
  listId: string;
  tags: Tag[];
  onAppended: (newItems: DoneItem[]) => void;
}

export function AddItemsButton({ listId, tags, onAppended }: AddItemsButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rawText, setRawText] = useState("");
  const [defaultTagId, setDefaultTagId] = useState<string | null>(null);

  const {
    step,
    drafts,
    status,
    error,
    handleTextareaSubmit,
    handleDraftTagChange,
    saveItems,
    resetToInput,
  } = useAddItems();

  const handleToggle = () => {
    if (isExpanded) {
      resetToInput();
      setRawText("");
      setDefaultTagId(null);
    }
    setIsExpanded((prev) => !prev);
  };

  const handleReview = () => {
    if (!rawText.trim()) return;
    handleTextareaSubmit(rawText, defaultTagId);
  };

  const handleSave = async () => {
    const newItems = await saveItems(listId);
    if (newItems.length > 0) {
      onAppended(newItems);
      resetToInput();
      setRawText("");
      setDefaultTagId(null);
      setIsExpanded(false);
    }
  };

  const handleBack = () => {
    resetToInput();
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleToggle}
        className="text-sm text-gray-400 hover:text-white transition-colors self-start"
      >
        {isExpanded ? "Cancel" : "Add items manually"}
      </button>

      {isExpanded && step === "input" && (
        <div className="flex flex-col gap-2">
          <select
            value={defaultTagId ?? ""}
            onChange={(e) => setDefaultTagId(e.target.value || null)}
            className="border border-gray-700 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">No default tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="One item per line"
            rows={6}
            className="border border-gray-700 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none"
          />
          <button
            onClick={handleReview}
            disabled={!rawText.trim()}
            className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors self-start"
          >
            Review
          </button>
        </div>
      )}

      {isExpanded && step === "review" && (
        <div className="flex flex-col gap-2">
          {drafts.map((draft) => (
            <div key={draft.draftId} className="flex gap-2 items-center">
              <p className="flex-1 text-sm">{draft.text}</p>
              <select
                value={draft.tagId ?? ""}
                onChange={(e) =>
                  handleDraftTagChange(draft.draftId, e.target.value || null)
                }
                className="border border-gray-700 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                <option value="">No tag</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
            >
              {status === "saving" ? "Saving..." : "Save items"}
            </button>
            <button
              onClick={handleBack}
              disabled={status === "saving"}
              className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}