"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Toggle } from "@/components/ui/Toggle";

interface TrainingToggleProps {
  listId: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
}

export function TrainingToggle({
  listId,
  value,
  onChange,
}: TrainingToggleProps) {
  const [optimisticValue, setOptimisticValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleToggle = async () => {
    const next = !optimisticValue;
    setOptimisticValue(next);
    setIsUpdating(true);
    setUpdateError(null);

    const { error } = await supabase
      .from("Lists")
      .update({ use_for_training: next })
      .eq("id", listId);

    if (error) {
      setOptimisticValue(!next);
      setUpdateError(error.message);
    } else {
      onChange(next);
    }

    setIsUpdating(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <Toggle
        checked={optimisticValue}
        onChange={handleToggle}
        disabled={isUpdating}
        label="use for training"
      />
      {updateError && (
        <p className="text-xs text-berry">{updateError?.toLowerCase()}</p>
      )}
    </div>
  );
}
