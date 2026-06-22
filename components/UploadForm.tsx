"use client";

import { useState } from "react";
import { HabiticaTagSelector } from "@/components/HabiticaTagSelector";
import { DateField } from "@/components/DateField";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";

interface Tag {
  id: string;
  name: string;
}

interface UploadFormProps {
  tags: Tag[];
  createTag: (name: string) => Promise<{ id: string; name: string } | null>;
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
    <Card className="flex flex-col gap-5">
      <FieldLabel label="Tag this list">
        <HabiticaTagSelector
          tags={tags}
          selectedTagId={selectedTagId}
          onChange={setSelectedTagId}
          createTag={createTag}
          isLoading={tagsLoading}
          createLoading={createLoading}
          error={tagsError}
        />
      </FieldLabel>

      {showDateField && (
        <DateField
          variant="inline"
          value={selectedDate}
          onChange={(date) => onDateChange?.(date)}
          label="done on"
        />
      )}

      <FieldLabel label="your done list">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-bark/30 bg-parchment-dark/30 px-4 py-6 text-center text-sm text-bark/70 transition-colors hover:border-bark/50 hover:bg-parchment-dark/50">
          <span>
            {selectedFile ? selectedFile.name : "choose a screenshot to upload"}
          </span>
          <span className="text-xs text-bark/50">PNG or JPG</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>
      </FieldLabel>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedFile}
        isLoading={isLoading}
      >
        {isLoading ? "sending it into the forest..." : "upload your done list"}
      </Button>

      {error && <p className="text-sm text-berry">{error}</p>}
    </Card>
  );
}
