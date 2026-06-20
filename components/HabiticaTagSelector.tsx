import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";

interface Tag {
  id: string;
  name: string;
}

interface HabiticaTagSelectorProps {
  tags: Tag[];
  selectedTagId: string | null;
  onChange: (tagId: string | null) => void;
  createTag: (name: string) => Promise<Tag | null>;
  isLoading: boolean;
  createLoading: boolean;
  error: string | null;
}

export function HabiticaTagSelector({
  tags,
  selectedTagId,
  onChange,
  createTag,
  isLoading,
  createLoading,
  error,
}: HabiticaTagSelectorProps) {
  const [newTagName, setNewTagName] = useState("");

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName.trim());
    if (tag) {
      onChange(tag.id);
      setNewTagName("");
    }
  };

  const tagOptions = tags.map((tag) => ({ id: tag.id, label: tag.name }));

  return (
    <div className="flex flex-col gap-3">
      <Dropdown
        options={tagOptions}
        value={selectedTagId}
        onChange={onChange}
        placeholder={isLoading ? "Gathering tags..." : "Select a tag"}
        disabled={isLoading}
      />

      <FieldLabel error={error}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="flex-1 rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
          />
          <Button
            variant="secondary"
            onClick={handleAddTag}
            disabled={!newTagName.trim()}
            isLoading={createLoading}
          >
            Add tag
          </Button>
        </div>
      </FieldLabel>
    </div>
  );
}
