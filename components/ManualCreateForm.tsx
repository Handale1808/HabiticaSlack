"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useManualCreate } from "@/hooks/useManualCreate";
import { HabiticaTagSelector } from "@/components/HabiticaTagSelector";
import { DateField } from "@/components/DateField";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Dropdown } from "@/components/ui/Dropdown";

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

  const draftTagOptions = [
    { id: "", label: "No tag" },
    ...tags.map((tag) => ({ id: tag.id, label: tag.name })),
  ];

  return (
    <div className="flex flex-col gap-4 border border-gray-700 rounded p-4">
      {step === "input" && (
        <Card className="flex flex-col gap-4">
          <FieldLabel label="Tag this list">
            <HabiticaTagSelector
              tags={tags}
              selectedTagId={defaultTagId}
              onChange={setDefaultTagId}
              createTag={createTag}
              isLoading={tagsLoading}
              createLoading={createLoading}
              error={tagsError}
            />
          </FieldLabel>
          <DateField
            variant="inline"
            value={completedAt}
            onChange={setCompletedAt}
            label="done on"
          />
          <FieldLabel label="Items">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="one item per line"
              rows={6}
              className="w-full resize-none rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </FieldLabel>
          <div className="flex gap-2">
            <Button
              onClick={handleReview}
              disabled={!rawText.trim()}
            >
              review
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              cancel
            </Button>
          </div>
        </Card>
      )}

      {step === "review" && (
        <Card className="flex flex-col gap-4">
          {drafts.length === 0 ? (
            <p className="text-sm text-bark/60">
              No items to review — head back and add a few lines.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {drafts.map((draft) => (
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
              ))}
            </div>
          )}

          {error && <p className="text-sm text-berry">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={() => saveList(completedAt)} isLoading={status === "saving"}>
              Save list
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
