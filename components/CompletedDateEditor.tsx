// components/CompletedDateEditor.tsx

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import { DateField } from "@/components/DateField";

interface CompletedDateEditorProps {
  listId: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export function CompletedDateEditor({
  listId,
  value,
  onChange,
}: CompletedDateEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (date: Date | null) => {
    setIsSaving(true);
    setError(null);

    const formatted = date ? format(date, "yyyy-MM-dd") : null;

    const { error: updateError } = await supabase
      .from("Lists")
      .update({ completed_at: formatted })
      .eq("id", listId);

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    onChange(date);
  };

  return (
    <div className="flex flex-col gap-1">
      <DateField
        variant="icon"
        value={value}
        onChange={handleSelect}
        disabled={isSaving}
      />
      {error && <p className="text-red-500 text-xs">{error?.toLowerCase()}</p>}
    </div>
  );
}