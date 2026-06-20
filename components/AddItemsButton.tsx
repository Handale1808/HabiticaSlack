// components/AddItemsButton.tsx

"use client";

import { useState } from "react";
import { useAddItems } from "@/hooks/useAddItems";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";

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

export function AddItemsButton({
  listId,
  tags,
  onAppended,
}: AddItemsButtonProps) {
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

  const tagItems = tags.map((tag) => ({ id: tag.id, label: tag.name }));
  const defaultTagOptions = [{ id: "", label: "No default tag" }, ...tagItems];
  const draftTagOptions = [{ id: "", label: "No tag" }, ...tagItems];

  return (
    <div className="flex flex-col gap-2">
      <Button variant="ghost" onClick={handleToggle} className="self-start">
        {isExpanded ? "Cancel" : "Add items manually"}
      </Button>

      {isExpanded && step === "input" && (
        <Card className="flex flex-col gap-3">
          <Dropdown
            options={defaultTagOptions}
            value={defaultTagId ?? ""}
            onChange={(tagId) => setDefaultTagId(tagId || null)}
            placeholder="No default tag"
          />
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="One item per line"
            rows={6}
            className="w-full resize-none rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
          />
          <Button
            onClick={handleReview}
            disabled={!rawText.trim()}
            className="self-start"
          >
            Review
          </Button>
        </Card>
      )}

      {isExpanded && step === "review" && (
        <Card className="flex flex-col gap-3">
          {drafts.length === 0 ? (
            <p className="text-sm text-bark/60">
              No items to review — head back and add a few lines.
            </p>
          ) : (
            drafts.map((draft) => (
              <div key={draft.draftId} className="flex items-center gap-2">
                <p className="flex-1 text-sm text-bark">{draft.text}</p>
                <div className="w-36">
                  <Dropdown
                    options={draftTagOptions}
                    value={draft.tagId ?? ""}
                    onChange={(tagId) =>
                      handleDraftTagChange(draft.draftId, tagId || null)
                    }
                    placeholder="No tag"
                  />
                </div>
              </div>
            ))
          )}

          {error && <p className="text-sm text-berry">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSave} isLoading={status === "saving"}>
              Save items
            </Button>
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={status === "saving"}
            >
              Back
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
