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
import { SendAllButton } from "@/components/SendAllButton";
import { SlackSendBlock } from "@/components/SlackSendBlock";
import { AppendUploadButton } from "@/components/AppendUploadButton";
import { AddItemsButton } from "@/components/AddItemsButton";
import { TrainingToggle } from "@/components/TrainingToggle";
import { format, parseISO } from "date-fns";
import { CompletedDateEditor } from "@/components/CompletedDateEditor";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
  const [useForTraining, setUseForTraining] = useState(false);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);

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

      const { data: listData } = await supabase
        .from("Lists")
        .select("use_for_training, completed_at")
        .eq("id", id)
        .single();

      if (listData) {
        setUseForTraining(listData.use_for_training);
        setCompletedAt(
          listData.completed_at ? parseISO(listData.completed_at) : null,
        );
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
  const {
    tags,
    createTag,
    isLoading: tagsLoading,
    createLoading,
  } = useHabiticaTags(
    currentUser?.habitica_user_id ?? "",
    currentUser?.habitica_api_token ?? "",
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

  const onAppended = (newItems: DoneItem[]) => {
    setInitialItems((prev) => [...prev, ...newItems]);
  };

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <div className="w-full max-w-lg">
        <Link
          href="/lists"
          className="text-sm text-bark/60 transition-colors hover:text-moss-dark"
        >
          back to lists
        </Link>
      </div>

      <h1 className="font-display text-3xl text-bark">done items</h1>

      {!isLoading && (
        <div className="w-full max-w-lg flex items-center gap-2">
          {completedAt && (
            <span className="text-sm text-bark/70">
              {format(completedAt, "d MMMM yyyy")}
            </span>
          )}
          <CompletedDateEditor
            listId={id}
            value={completedAt}
            onChange={setCompletedAt}
          />
        </div>
      )}

      {!isLoading && currentUser && (
        <Card className="flex w-full max-w-lg flex-col gap-3">
          <AppendUploadButton
            listId={id}
            userId={currentUser.id}
            tags={tags}
            createTag={createTag}
            tagsLoading={tagsLoading}
            createLoading={createLoading}
            onAppended={onAppended}
            disabled={isLoading}
          />
          <AddItemsButton listId={id} tags={tags} onAppended={onAppended} />
          <TrainingToggle
            listId={id}
            value={useForTraining}
            onChange={setUseForTraining}
          />
        </Card>
      )}

      {isLoading && (
        <p className="text-sm text-bark/60">gathering this list...</p>
      )}
      {error && <p className="text-sm text-berry">{error}</p>}

      {!isLoading && !error && items.length === 0 && (
        <p className="text-sm text-bark/60">no items found for this list.</p>
      )}

      {!isLoading && items.length > 0 && (
        <div className="flex w-full max-w-lg flex-col gap-3">
          <Card className="flex flex-col gap-3">
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
              <p className="text-sm text-bark/60">tucking that change in...</p>
            )}
            {updateStatus === "error" && (
              <p className="text-sm text-berry">{updateError}</p>
            )}
          </Card>

          <SendAllButton items={items} sendItem={sendItem} />
          <SlackSendBlock
            enrichmentStatus={enrichmentStatus}
            enrichedItems={enrichedItems}
            summary={summary}
            availableCategories={availableCategories}
            onCategoryChange={handleCategoryChange}
            onTrigger={() => triggerEnrichment(items)}
            onConfirm={confirmSend}
            onCancel={cancelPreview}
            sendError={enrichmentError}
            disabled={!id}
          />
        </div>
      )}
    </main>
  );
}
