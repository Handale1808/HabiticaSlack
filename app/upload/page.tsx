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

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");

  const { upload, reset, status, doneItems, errorMessage } = useUpload();
  const { currentUser } = useUser();
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

  const [isBulkSending, setIsBulkSending] = useState(false);

  const { sendItem, sendingIds, sendErrors } = useHabiticaSend(
    currentUser?.habitica_user_id ?? "",
    currentUser?.habitica_api_token ?? "",
    markAsSent,
  );

  const handleSendAll = async () => {
    setIsBulkSending(true);
    const unsent = items.filter((item) => item.habitica_send !== true);
    for (const item of unsent) {
      await sendItem(item);
    }
    setIsBulkSending(false);
  };

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    upload(selectedFile, currentUser.id, selectedTagId);
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim());
    if (tag) {
      setSelectedTagId(tag.id);
      setNewTagName("");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedTagId(null);
    setNewTagName("");
    reset();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Upload your done list</h1>
      <p className="text-sm text-gray-500">Logged in as {currentUser.name}</p>

      {status !== "success" && (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="flex flex-col gap-2">
            <select
              value={selectedTagId ?? ""}
              onChange={(e) => setSelectedTagId(e.target.value || null)}
              disabled={tagsLoading}
              className="border border-gray-700 rounded px-4 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
            >
              <option value="" disabled>
                {tagsLoading ? "Loading tags..." : "Select a tag"}
              </option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name"
                className="flex-1 border border-gray-700 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTagName.trim() || createLoading}
                className="bg-black text-white rounded px-3 py-2 text-sm disabled:opacity-50 border border-gray-700"
              >
                {createLoading ? "..." : "Add tag"}
              </button>
            </div>

            {tagsError && <p className="text-red-500 text-sm">{tagsError}</p>}
          </div>

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
        </div>
      )}
    </main>
  );
}
