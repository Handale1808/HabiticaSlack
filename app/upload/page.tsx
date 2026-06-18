// app/upload/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/hooks/useUpload";
import { useUser } from "@/context/UserContext";
import { useDoneItems } from "@/hooks/useDoneItems";
import { DoneItemRow } from "@/components/DoneItemRow";
import { useHabiticaTags } from "@/hooks/useHabiticaTags";
import { useHabiticaSend } from "@/hooks/useHabiticaSend";
import { useSlackSend } from "@/hooks/useSlackSend";
import { SendAllButton } from "@/components/SendAllButton";
import { SlackSendBlock } from "@/components/SlackSendBlock";
import { UploadForm } from "@/components/UploadForm";

export default function UploadPage() {
  const { upload, reset, status, doneItems, listId, errorMessage } =
    useUpload();
  const { currentUser, isRehydrating } = useUser();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => new Date(),
  );

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

  const {
    items,
    handleTextChange,
    handleBlur,
    handleTagChange,
    markAsSent,
    updateStatus,
    updateError,
  } = useDoneItems(doneItems);

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
  } = useSlackSend(listId ?? "", items);

  useEffect(() => {
    if (!isRehydrating && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isRehydrating, router]);

  if (isRehydrating) return null;
  if (!currentUser) return null;

  const handleReset = () => {
    reset();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="w-full max-w-sm flex justify-end">
        <button
          onClick={() => router.push("/lists")}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          New list
        </button>
      </div>
      <h1 className="text-2xl font-bold">Upload your done list</h1>
      <p className="text-sm text-gray-500">Logged in as {currentUser.name}</p>

      {status !== "success" && (
        <div className="w-full max-w-sm">
          <UploadForm
            tags={tags}
            createTag={createTag}
            tagsLoading={tagsLoading}
            createLoading={createLoading}
            tagsError={tagsError}
            onUpload={(file, tagId, completedAt) =>
              upload(file, currentUser.id, tagId, completedAt)
            }
            isLoading={status === "loading"}
            error={errorMessage}
            showDateField
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      )}

      {status === "success" && (
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
                const found = items.find((i) => i.id === id);
                if (found) sendItem(found);
              }}
            />
          ))}
          {updateStatus === "error" && (
            <p className="text-red-500 text-sm">{updateError}</p>
          )}
          {updateStatus === "saving" && (
            <p className="text-gray-500 text-sm">Saving...</p>
          )}
          <button
            onClick={handleReset}
            className="bg-black text-white rounded px-4 py-2 text-sm mt-2"
          >
            Upload another
          </button>
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
            disabled={!listId}
          />
        </div>
      )}
    </main>
  );
}
