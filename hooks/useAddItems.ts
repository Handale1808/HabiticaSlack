import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AddItemsStep = "input" | "review";
type AddItemsStatus = "idle" | "saving" | "success" | "error";

interface DraftItem {
  draftId: string;
  text: string;
  tagId: string | null;
}

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
}

interface UseAddItemsReturn {
  step: AddItemsStep;
  drafts: DraftItem[];
  status: AddItemsStatus;
  error: string | null;
  handleTextareaSubmit: (rawText: string, defaultTagId: string | null) => void;
  handleDraftTagChange: (draftId: string, tagId: string | null) => void;
  saveItems: (listId: string) => Promise<DoneItem[]>;
  resetToInput: () => void;
}

export function useAddItems(): UseAddItemsReturn {
  const [step, setStep] = useState<AddItemsStep>("input");
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [status, setStatus] = useState<AddItemsStatus>("idle");
  const [error, setError] = useState<string | null>(null);

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

  const saveItems = async (listId: string): Promise<DoneItem[]> => {
    setStatus("saving");
    setError(null);

    const rows = drafts.map((draft) => ({
      list_id: listId,
      text: draft.text,
      habitica_tag: draft.tagId,
    }));

    const { data: insertedItems, error: insertError } = await supabase
      .from("DoneItems")
      .insert(rows)
      .select("id, text, habitica_tag, habitica_send, habitica_id");

    if (insertError || !insertedItems) {
      setStatus("error");
      setError(insertError?.message ?? "No data returned from insert");
      return [];
    }

    setStatus("success");
    return insertedItems;
  };

  const resetToInput = (): void => {
    setStep("input");
    setDrafts([]);
    setStatus("idle");
    setError(null);
  };

  return {
    step,
    drafts,
    status,
    error,
    handleTextareaSubmit,
    handleDraftTagChange,
    saveItems,
    resetToInput,
  };
}