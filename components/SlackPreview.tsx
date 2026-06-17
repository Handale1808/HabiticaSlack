import { EnrichedItem } from "@/hooks/useSlackSend";

interface SlackPreviewProps {
  enrichedItems: EnrichedItem[];
  summary: string;
  availableCategories: string[];
  onCategoryChange: (id: string, category: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSending: boolean;
  sendError: string | null;
}

export function SlackPreview({
  enrichedItems,
  summary,
  availableCategories,
  onCategoryChange,
  onConfirm,
  onCancel,
  isSending,
  sendError,
}: SlackPreviewProps) {
  const grouped = enrichedItems.reduce<Record<string, EnrichedItem[]>>((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 border border-gray-700 rounded p-4 mt-2">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="flex flex-col gap-2">
          <p className="text-sm font-semibold">{category}</p>
          {categoryItems.map((item) => (
            <div key={item.id} className="flex gap-2 items-start">
              <p className="flex-1 text-sm text-gray-300">{item.slack_text}</p>
              <select
                value={item.category}
                onChange={(e) => onCategoryChange(item.id, e.target.value)}
                className="border border-gray-700 rounded px-2 py-1 text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ))}

      <div className="border-t border-gray-700 pt-4">
        <p className="text-sm text-gray-400">{summary}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={isSending}
          className="bg-black text-white border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
        >
          {isSending ? "Sending..." : "Confirm and send"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSending}
          className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
        >
          Cancel
        </button>
      </div>

      {sendError && <p className="text-red-500 text-xs">{sendError}</p>}
    </div>
  );
}