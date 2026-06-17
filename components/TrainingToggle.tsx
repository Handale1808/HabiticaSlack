"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface TrainingToggleProps {
  listId: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
}

export function TrainingToggle({ listId, value, onChange }: TrainingToggleProps) {
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
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={`text-sm transition-colors disabled:opacity-50 self-start ${
          optimisticValue
            ? "text-white"
            : "text-gray-400 hover:text-white"
        }`}
      >
        {optimisticValue ? "Used for training" : "Use for training"}
      </button>
      {updateError && (
        <p className="text-red-500 text-xs">{updateError}</p>
      )}
    </div>
  );
}