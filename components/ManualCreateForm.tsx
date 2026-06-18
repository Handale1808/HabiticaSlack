"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useManualCreate } from "@/hooks/useManualCreate";
import { HabiticaTagSelector } from "@/components/HabiticaTagSelector";
import { DateField } from "@/components/DateField";

interface Tag {
  id: string;
  name: string;
}

interface ManualCreateFormProps {
  tags: Tag[];
  createTag: (name: string) => Promise<Tag | null>;
  tagsLoading: boolean;
  createLoading: boolean;
  tagsError: string | null;
  onCancel: () => void;
}

export function ManualCreateForm({
  tags,
  createTag,
  tagsLoading,
  createLoading,
  tagsError,
  onCancel,
}: ManualCreateFormProps) {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [defaultTagId, setDefaultTagId] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(() => new Date());

  const {
    step,
    drafts,
    status,
    error,
    newListId,
    handleTextareaSubmit,
    handleDraftTagChange,
    saveList,
    resetToInput,
  } = useManualCreate();

  useEffect(() => {
    if (newListId) {
      router.push(`/lists/${newListId}`);
    }
  }, [newListId, router]);

  const handleReview = () => {
    if (!rawText.trim()) return;
    handleTextareaSubmit(rawText, defaultTagId);
  };

  const handleBack = () => {
    resetToInput();
  };

  return (
    <div className="flex flex-col gap-4 border border-gray-700 rounded p-4">
      {step === "input" && (
        <>
          <HabiticaTagSelector
            tags={tags}
            selectedTagId={defaultTagId}
            onChange={setDefaultTagId}
            createTag={createTag}
            isLoading={tagsLoading}
            createLoading={createLoading}
            error={tagsError}
          />
          <DateField
            variant="inline"
            value={completedAt}
            onChange={setCompletedAt}
            label="Done on"
          />
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="One item per line"
            rows={6}
            className="border border-gray-700 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => saveList(completedAt)}
              disabled={status === "saving"}
              className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
            >
              Review
            </button>
            <button
              onClick={onCancel}
              className="border border-gray-700 rounded px-4 py-2 text-sm hover:bg-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {step === "review" && (
        <>
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
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={saveList}
              disabled={status === "saving"}
              className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
            >
              {status === "saving" ? "Saving..." : "Save list"}
            </button>
            <button
              onClick={handleBack}
              disabled={status === "saving"}
              className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
