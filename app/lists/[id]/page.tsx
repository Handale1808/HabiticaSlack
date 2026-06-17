// app/lists/[id]/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useDoneItems } from "@/hooks/useDoneItems";
import { DoneItemRow } from "@/components/DoneItemRow";
import { useUser } from "@/context/UserContext";
import { useHabiticaTags } from "@/hooks/useHabiticaTags";
import { useHabiticaSend } from "@/hooks/useHabiticaSend";
import { useSlackSend } from "@/hooks/useSlackSend";
import { SlackPreview } from "@/components/SlackPreview";

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
}

export default function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const [initialItems, setInitialItems] = useState<DoneItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("DoneItems")
        .select(
          "id, text, habitica_tag, habitica_send, habitica_id, slack_text, category",
        )
        .eq("list_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setInitialItems(data ?? []);
      setIsLoading(false);
    };

    fetchItems();
  }, [id]);

  const {
    items,
    handleTextChange,
    handleBlur,
    handleTagChange,
    markAsSent,
    updateStatus,
    updateError,
  } = useDoneItems(initialItems);

  const { currentUser } = useUser();
  const { tags } = useHabiticaTags(
    currentUser?.habitica_user_id ?? "",
    currentUser?.habitica_api_token ?? "",
  );

  const [isBulkSending, setIsBulkSending] = useState(false);

  console.log(
    "habitica creds",
    currentUser?.habitica_user_id,
    currentUser?.habitica_api_token,
  );

  const { sendItem, sendingIds, sendErrors } = useHabiticaSend(
    currentUser?.habitica_user_id ?? "",
    currentUser?.habitica_api_token ?? "",
    markAsSent,
  );

  const {
    triggerEnrichment,
    enrichedItems,
    summary,
    availableCategories,
    handleCategoryChange,
    confirmSend,
    cancelPreview,
    enrichmentStatus,
    enrichmentError,
  } = useSlackSend(id, items);

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
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <div className="w-full max-w-lg">
        <Link
          href="/lists"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Back to lists
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Done items</h1>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!isLoading && !error && items.length === 0 && (
        <p className="text-sm text-gray-500">No items found for this list.</p>
      )}

      {!isLoading && items.length > 0 && (
        <div className="flex flex-col gap-3 w-full max-w-lg">
          {items.map((item) => (
            <DoneItemRow
              key={item.id}
              id={item.id}
              text={item.text}
              tagId={item.habitica_tag}
              tags={tags}
              habiticaSend={item.habitica_send}
              isSending={sendingIds.has(item.id)}
              sendError={sendErrors[item.id] ?? null}
              onChange={handleTextChange}
              onBlur={handleBlur}
              onTagChange={handleTagChange}
              onSend={(id) => {
                const item = items.find((i) => i.id === id);
                if (item) sendItem(item);
              }}
            />
          ))}
          {updateStatus === "saving" && (
            <p className="text-gray-500 text-sm">Saving...</p>
          )}
          {updateStatus === "error" && (
            <p className="text-red-500 text-sm">{updateError}</p>
          )}

          <button
            onClick={handleSendAll}
            disabled={
              isBulkSending ||
              items.every((item) => item.habitica_send === true)
            }
            className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
          >
            {isBulkSending ? "Sending..." : "Send all to Habitica"}
          </button>

          <button
            onClick={() => triggerEnrichment(items)}
            disabled={
              enrichmentStatus === "loading" || enrichmentStatus === "success"
            }
            className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
          >
            {enrichmentStatus === "loading"
              ? "Preparing..."
              : enrichmentStatus === "success"
                ? "Sent to Slack"
                : "Send to Slack"}
          </button>

          {(enrichmentStatus === "preview" ||
            enrichmentStatus === "sending" ||
            enrichmentStatus === "error") &&
            enrichedItems.length > 0 &&
            summary && (
              <SlackPreview
                enrichedItems={enrichedItems}
                summary={summary}
                availableCategories={availableCategories}
                onCategoryChange={handleCategoryChange}
                onConfirm={confirmSend}
                onCancel={cancelPreview}
                isSending={enrichmentStatus === "sending"}
                sendError={enrichmentError}
              />
            )}

          {enrichmentStatus === "success" && (
            <p className="text-gray-500 text-sm">Successfully sent to Slack.</p>
          )}
        </div>
      )}
    </main>
  );
}
