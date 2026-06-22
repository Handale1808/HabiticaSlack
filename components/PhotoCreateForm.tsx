// components/PhotoCreateForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/hooks/useUpload";
import { UploadForm } from "@/components/UploadForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Tag {
  id: string;
  name: string;
}

interface PhotoCreateFormProps {
  tags: Tag[];
  createTag: (name: string) => Promise<{ id: string; name: string } | null>;
  tagsLoading: boolean;
  createLoading: boolean;
  tagsError: string | null;
  userId: string;
  onCancel: () => void;
}

export function PhotoCreateForm({
  tags,
  createTag,
  tagsLoading,
  createLoading,
  tagsError,
  userId,
  onCancel,
}: PhotoCreateFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => new Date(),
  );

  const { upload, status, listId, errorMessage } = useUpload();

  useEffect(() => {
    if (listId) {
      router.push(`/lists/${listId}`);
    }
  }, [listId, router]);

  const handleUpload = (
    file: File,
    tagId: string | null,
    completedAt: Date | null,
  ) => {
    upload(file, userId, tagId, completedAt);
  };

  return (
    <Card className="flex flex-col gap-4">
      <UploadForm
        tags={tags}
        createTag={createTag}
        tagsLoading={tagsLoading}
        createLoading={createLoading}
        tagsError={tagsError}
        onUpload={handleUpload}
        isLoading={status === "loading"}
        error={errorMessage}
        showDateField
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <Button variant="ghost" onClick={onCancel} className="self-start">
        cancel
      </Button>
    </Card>
  );
}
