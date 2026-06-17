import { useState } from "react";

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

  return (
    <div className="flex flex-col gap-2">
      <select
        value={selectedTagId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={isLoading}
        className="border border-gray-700 rounded px-4 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
      >
        <option value="" disabled>
          {isLoading ? "Loading tags..." : "Select a tag"}
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

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}