"use client";

import { useState } from "react";

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

  return (
    <button
      onClick={handleSendAll}
      disabled={isBulkSending || items.every((item) => item.habitica_send === true)}
      className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
    >
      {isBulkSending ? "Sending..." : "Send all to Habitica"}
    </button>
  );
}