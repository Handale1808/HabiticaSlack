"use client";

import { useState } from "react";
import { useAppendUpload } from "@/hooks/useAppendUpload";

interface Tag {
  id: string;
  name: string;
}

interface AppendUploadButtonProps {
  listId: string;
  userId: string;
  tags: Tag[];
  onAppended: (newItems: DoneItem[]) => void;
  disabled?: boolean;
}

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
}

interface AppendUploadButtonProps {
  listId: string;
  userId: string;
  onAppended: (newItems: DoneItem[]) => void;
  disabled?: boolean;
}

export function AppendUploadButton({
  listId,
  userId,
  tags,
  onAppended,
  disabled = false,
}: AppendUploadButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const { appendUpload, status, errorMessage } = useAppendUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const newItems = await appendUpload(
      selectedFile,
      userId,
      listId,
      selectedTagId,
    );
    if (newItems.length > 0) {
      onAppended(newItems);
      setIsExpanded(false);
      setSelectedFile(null);
      setSelectedTagId(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        disabled={disabled}
        className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 self-start"
      >
        {isExpanded ? "Cancel" : "Add from photo"}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-2">
          <select
            value={selectedTagId ?? ""}
            onChange={(e) => setSelectedTagId(e.target.value || null)}
            className="border border-gray-700 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">No tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || status === "loading"}
            className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors self-start"
          >
            {status === "loading" ? "Uploading..." : "Upload"}
          </button>
          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
