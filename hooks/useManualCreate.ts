import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

type ManualCreateStep = "input" | "review";
type ManualCreateStatus = "idle" | "saving" | "success" | "error";

interface DraftItem {
  draftId: string;
  text: string;
  tagId: string | null;
}

interface UseManualCreateReturn {
  step: ManualCreateStep;
  drafts: DraftItem[];
  status: ManualCreateStatus;
  error: string | null;
  newListId: string | null;
  handleTextareaSubmit: (rawText: string, defaultTagId: string | null) => void;
  handleDraftTagChange: (draftId: string, tagId: string | null) => void;
  saveList: (completedAt: Date | null) => Promise<void>;
  resetToInput: () => void;
}

export function useManualCreate(): UseManualCreateReturn {
  const [step, setStep] = useState<ManualCreateStep>("input");
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [status, setStatus] = useState<ManualCreateStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [newListId, setNewListId] = useState<string | null>(null);

  const handleTextareaSubmit = (
    rawText: string,
    defaultTagId: string | null,
  ): void => {
    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsed: DraftItem[] = lines.map((text, index) => ({
      draftId: `draft-${index}-${Date.now()}`,
      text,
      tagId: defaultTagId,
    }));

    setDrafts(parsed);
    setStep("review");
  };

  const handleDraftTagChange = (
    draftId: string,
    tagId: string | null,
  ): void => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.draftId === draftId ? { ...draft, tagId } : draft,
      ),
    );
  };

  const saveList = async (completedAt: Date | null): Promise<void> => {
    setStatus("saving");
    setError(null);

    const { data: listData, error: listError } = await supabase
      .from("Lists")
      .insert({
        completed_at: completedAt ? format(completedAt, "yyyy-MM-dd") : null,
      })
      .select("id")
      .single();

    if (listError || !listData) {
      setStatus("error");
      setError(listError?.message ?? "No data returned from Lists insert");
      return;
    }

    const doneItemRows = drafts.map((draft) => ({
      list_id: listData.id,
      text: draft.text,
      habitica_tag: draft.tagId,
    }));

    const { error: doneItemsError } = await supabase
      .from("DoneItems")
      .insert(doneItemRows);

    if (doneItemsError) {
      setStatus("error");
      setError(doneItemsError.message);
      return;
    }

    setStatus("success");
    setNewListId(listData.id);
  };

  const resetToInput = (): void => {
    setStep("input");
    setDrafts([]);
    setStatus("idle");
    setError(null);
    setNewListId(null);
  };

  return {
    step,
    drafts,
    status,
    error,
    newListId,
    handleTextareaSubmit,
    handleDraftTagChange,
    saveList,
    resetToInput,
  };
}
