
// hooks/useDoneItems.ts

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
}

type UpdateStatus = "idle" | "saving" | "error";

interface UseDoneItemsReturn {
  items: DoneItem[];
  handleTextChange: (id: string, text: string) => void;
  handleBlur: (id: string) => Promise<void>;
  handleTagChange: (id: string, tagId: string | null) => Promise<void>;
  updateStatus: UpdateStatus;
  updateError: string | null;
}

export function useDoneItems(initialItems: DoneItem[]): UseDoneItemsReturn {
  const [items, setItems] = useState<DoneItem[]>(initialItems);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>("idle");
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
  if (initialItems.length > 0) {
    setItems(initialItems);
  }
}, [initialItems]);

  const handleTextChange = (id: string, text: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  };

  const handleBlur = async (id: string) => {
    const current = items.find((item) => item.id === id);
    const original = initialItems.find((item) => item.id === id);

    if (!current || !original || current.text === original.text) return;

    setUpdateStatus("saving");
    setUpdateError(null);

    const { error } = await supabase
      .from("DoneItems")
      .update({ text: current.text })
      .eq("id", id);

    if (error) {
      setUpdateStatus("error");
      setUpdateError(error.message);
      return;
    }

    setUpdateStatus("idle");
  };

  const handleTagChange = async (id: string, tagId: string | null) => {
  setItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, habitica_tag: tagId } : item)),
  );

  setUpdateStatus("saving");
  setUpdateError(null);

  const { error } = await supabase
    .from("DoneItems")
    .update({ habitica_tag: tagId })
    .eq("id", id);

  if (error) {
    setUpdateStatus("error");
    setUpdateError(error.message);
    return;
  }

  setUpdateStatus("idle");
};

  return { items, handleTextChange, handleBlur, handleTagChange, updateStatus, updateError };
}