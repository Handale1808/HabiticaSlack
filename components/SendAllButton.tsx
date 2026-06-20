"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
}

interface SendAllButtonProps {
  items: DoneItem[];
  sendItem: (item: DoneItem) => Promise<void>;
}

export function SendAllButton({ items, sendItem }: SendAllButtonProps) {
  const [isBulkSending, setIsBulkSending] = useState(false);

  const handleSendAll = async () => {
    setIsBulkSending(true);
    const unsent = items.filter((item) => item.habitica_send !== true);
    for (const item of unsent) {
      await sendItem(item);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    setIsBulkSending(false);
  };

const allSent = items.every((item) => item.habitica_send === true);
  const unsentCount = items.filter((item) => item.habitica_send !== true).length;

  return (
    <Button
      variant="secondary"
      onClick={handleSendAll}
      disabled={allSent}
      isLoading={isBulkSending}
    >
      {allSent
        ? "all sent to Habitica"
        : `send ${unsentCount} ${unsentCount === 1 ? "item" : "items"} to Habitica`}
    </Button>
  );
}