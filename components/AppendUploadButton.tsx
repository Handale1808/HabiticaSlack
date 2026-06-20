"use client";

import { useAppendUpload } from "@/hooks/useAppendUpload";
import { UploadForm } from "@/components/UploadForm";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Tag {
  id: string;
  name: string;
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
  tags: Tag[];
  createTag: (name: string) => Promise<void>;
  tagsLoading: boolean;
  createLoading: boolean;
  onAppended: (newItems: DoneItem[]) => void;
  disabled?: boolean;
}

export function AppendUploadButton({
  listId,
  userId,
  tags,
  createTag,
  tagsLoading,
  createLoading,
  onAppended,
  disabled = false,
}: AppendUploadButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { appendUpload, status, errorMessage } = useAppendUpload();

  const handleUpload = async (
    file: File,
    tagId: string | null,
    _completedAt: Date | null,
  ) => {
    const newItems = await appendUpload(file, userId, listId, tagId);
    if (newItems.length > 0) {
      onAppended(newItems);
      setIsExpanded(false);
    }
  };

 return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded((prev) => !prev)}
        disabled={disabled}
        className="self-start"
      >
        {isExpanded ? "Cancel" : "Add from photo"}
      </Button>

      {isExpanded && (
        <UploadForm
          tags={tags}
          createTag={createTag}
          tagsLoading={tagsLoading}
          createLoading={createLoading}
          tagsError={null}
          onUpload={handleUpload}
          isLoading={status === "loading"}
          error={errorMessage}
        />
      )}
    </div>
  );
}
