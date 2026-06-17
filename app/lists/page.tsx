"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSlackSend } from "@/hooks/useSlackSend";
import { SlackPreview } from "@/components/SlackPreview";

interface ListRow {
  id: string;
  created_at: string;
  slack_sent: boolean | null;
}

export default function ListsPage() {
  const [lists, setLists] = useState<ListRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [activeSlackListId, setActiveSlackListId] = useState<string | null>(
    null,
  );
  const [slackItems, setSlackItems] = useState<
    {
      id: string;
      text: string;
      habitica_tag: string | null;
      habitica_send: boolean | null;
      habitica_id: string | null;
    }[]
  >([]);
  const [slackItemsLoading, setSlackItemsLoading] = useState(false);
  const [slackItemsError, setSlackItemsError] = useState<string | null>(null);

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
  } = useSlackSend(activeSlackListId ?? "", slackItems);

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("Lists")
        .select("id, created_at, slack_sent")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setLists(data ?? []);
      setIsLoading(false);
    };

    fetchLists();
  }, []);

  const handleSlackClick = async (listId: string) => {
    if (activeSlackListId && activeSlackListId !== listId) {
      cancelPreview();
    }

    setActiveSlackListId(listId);
    setSlackItemsError(null);
    setSlackItemsLoading(true);

    const { data, error } = await supabase
      .from("DoneItems")
      .select("id, text, habitica_tag, habitica_send, habitica_id")
      .eq("list_id", listId);

    setSlackItemsLoading(false);

    if (error) {
      setSlackItemsError(error.message);
      return;
    }

    setSlackItems(data ?? []);
    await triggerEnrichment();
  };

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Your lists</h1>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!isLoading && !error && lists.length === 0 && (
        <p className="text-sm text-gray-500">
          No lists yet. Upload a done list to get started.
        </p>
      )}

      {!isLoading && lists.length > 0 && (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {lists.map((list) => (
            <div key={list.id} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/lists/${list.id}`)}
                  className="flex-1 border border-gray-700 rounded px-4 py-3 text-sm text-left hover:bg-gray-900 transition-colors"
                >
                  {new Date(list.created_at).toLocaleString("en-ZA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </button>
                {list.slack_sent ? (
                  <span className="border border-gray-700 rounded px-4 py-3 text-sm text-gray-500">
                    Sent
                  </span>
                ) : (
                  <button
                    onClick={() => handleSlackClick(list.id)}
                    disabled={
                      slackItemsLoading ||
                      (activeSlackListId === list.id &&
                        (enrichmentStatus === "loading" ||
                          enrichmentStatus === "sending" ||
                          enrichmentStatus === "success"))
                    }
                    className="border border-gray-700 rounded px-4 py-3 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
                  >
                    {activeSlackListId === list.id &&
                    enrichmentStatus === "loading"
                      ? "Preparing..."
                      : "Send to Slack"}
                  </button>
                )}
              </div>

              {activeSlackListId === list.id && slackItemsError && (
                <p className="text-red-500 text-xs">{slackItemsError}</p>
              )}

              {activeSlackListId === list.id &&
                (enrichmentStatus === "preview" ||
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

              {activeSlackListId === list.id &&
                enrichmentStatus === "success" && (
                  <p className="text-gray-500 text-sm">
                    Successfully sent to Slack.
                  </p>
                )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
