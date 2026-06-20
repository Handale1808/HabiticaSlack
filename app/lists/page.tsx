"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSlackSend } from "@/hooks/useSlackSend";
import { useUser } from "@/context/UserContext";
import { useHabiticaTags } from "@/hooks/useHabiticaTags";
import { ManualCreateForm } from "@/components/ManualCreateForm";
import { format } from "date-fns";
import { PhotoCreateForm } from "@/components/PhotoCreateForm";
import { ListCard } from "@/components/ListCard";
import { Button } from "@/components/ui/Button";

interface ListRow {
  id: string;
  created_at: string;
  completed_at: string | null;
  slack_sent: boolean | null;
  use_for_training: boolean;
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

  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const { currentUser } = useUser();
  const {
    tags,
    createTag,
    isLoading: tagsLoading,
    createLoading,
    error: tagsError,
  } = useHabiticaTags(
    currentUser?.habitica_user_id ?? "",
    currentUser?.habitica_api_token ?? "",
  );

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("Lists")
        .select("id, created_at, completed_at, slack_sent, use_for_training")
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
      .select(
        "id, text, habitica_tag, habitica_send, habitica_id, slack_text, category",
      )
      .eq("list_id", listId);

    setSlackItemsLoading(false);

    if (error) {
      setSlackItemsError(error.message);
      return;
    }

    const fetched = data ?? [];
    setSlackItems(fetched);
    await triggerEnrichment(fetched, listId);
  };

  const handleTrainingChange = (listId: string, newValue: boolean) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, use_for_training: newValue } : l,
      ),
    );
  };

  const handleCompletedAtChange = (listId: string, newDate: Date | null) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              completed_at: newDate ? format(newDate, "yyyy-MM-dd") : null,
            }
          : l,
      ),
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-8">
      <div className="flex w-full max-w-sm items-center justify-between gap-2">
        <h1 className="font-display text-3xl text-bark">Your lists</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setIsUploadingPhoto(false);
              setIsCreating((prev) => !prev);
            }}
          >
            {isCreating ? "Cancel" : "New manual list"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setIsCreating(false);
              setIsUploadingPhoto((prev) => !prev);
            }}
          >
            {isUploadingPhoto ? "Cancel" : "New list from photo"}
          </Button>
        </div>
      </div>

      {isCreating && (
        <div className="w-full max-w-sm">
          <ManualCreateForm
            tags={tags}
            createTag={createTag}
            tagsLoading={tagsLoading}
            createLoading={createLoading}
            tagsError={tagsError}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      {isUploadingPhoto && currentUser && (
        <div className="w-full max-w-sm">
          <PhotoCreateForm
            tags={tags}
            createTag={createTag}
            tagsLoading={tagsLoading}
            createLoading={createLoading}
            tagsError={tagsError}
            userId={currentUser.id}
            onCancel={() => setIsUploadingPhoto(false)}
          />
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-bark/60">gathering your lists...</p>
      )}
      {error && <p className="text-sm text-berry">{error}</p>}

      {!isLoading && !error && lists.length === 0 && (
        <p className="text-sm text-bark/60">
          no lists yet — upload a done list to get started.
        </p>
      )}

      {!isLoading && lists.length > 0 && (
        <div className="flex w-full max-w-sm flex-col gap-3">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              isActive={activeSlackListId === list.id}
              slackItemsLoading={slackItemsLoading}
              slackItemsError={slackItemsError}
              enrichmentStatus={enrichmentStatus}
              enrichedItems={enrichedItems}
              summary={summary}
              availableCategories={availableCategories}
              enrichmentError={enrichmentError}
              onOpen={() => router.push(`/lists/${list.id}`)}
              onSlackClick={() => handleSlackClick(list.id)}
              onCategoryChange={handleCategoryChange}
              onConfirm={confirmSend}
              onCancel={cancelPreview}
              onCompletedAtChange={(date) =>
                handleCompletedAtChange(list.id, date)
              }
              onTrainingChange={(newValue) =>
                handleTrainingChange(list.id, newValue)
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
