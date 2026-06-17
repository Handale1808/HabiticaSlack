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
import { HabiticaTagSelector } from "@/components/HabiticaTagSelector";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const { upload, reset, status, doneItems, listId, errorMessage } =
    useUpload();
  const { currentUser, isRehydrating } = useUser();
  const router = useRouter();

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    upload(selectedFile, currentUser.id, selectedTagId);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedTagId(null);
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
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <HabiticaTagSelector
            tags={tags}
            selectedTagId={selectedTagId}
            onChange={setSelectedTagId}
            createTag={createTag}
            isLoading={tagsLoading}
            createLoading={createLoading}
            error={tagsError}
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || status === "loading"}
            className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {status === "loading" ? "Uploading..." : "Upload"}
          </button>
          {status === "error" && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
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
