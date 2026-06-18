"use client";

import { useState } from "react";
import { HabiticaTagSelector } from "@/components/HabiticaTagSelector";
import { DateField } from "@/components/DateField";

interface Tag {
  id: string;
  name: string;
}

interface UploadFormProps {
  tags: Tag[];
  createTag: (name: string) => Promise<void>;
  tagsLoading: boolean;
  createLoading: boolean;
  tagsError: string | null;
  onUpload: (
    file: File,
    tagId: string | null,
    completedAt: Date | null,
  ) => void;
  isLoading: boolean;
  error: string | null;
  showDateField?: boolean;
  selectedDate?: Date | null;
  onDateChange?: (date: Date | null) => void;
}

export function UploadForm({
  tags,
  createTag,
  tagsLoading,
  createLoading,
  tagsError,
  onUpload,
  isLoading,
  error,
  showDateField = false,
  selectedDate = null,
  onDateChange,
}: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    onUpload(selectedFile, selectedTagId, selectedDate);
  };

  return (
    <div className="flex flex-col gap-4">
      <HabiticaTagSelector
        tags={tags}
        selectedTagId={selectedTagId}
        onChange={setSelectedTagId}
        createTag={createTag}
        isLoading={tagsLoading}
        createLoading={createLoading}
        error={tagsError}
      />
      {showDateField && (
        <DateField
          variant="inline"
          value={selectedDate}
          onChange={(date) => onDateChange?.(date)}
          label="Done on"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-sm"
      />
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-50"
      >
        {isLoading ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
