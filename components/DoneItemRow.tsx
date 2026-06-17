// components/DoneItemRow.tsx

interface Tag {
  id: string;
  name: string;
}

interface DoneItemRowProps {
  id: string;
  text: string;
  tagId: string | null;
  tags: Tag[];
  habiticaSend: boolean | null;
  isSending: boolean;
  sendError: string | null;
  onChange: (id: string, text: string) => void;
  onBlur: (id: string) => void;
  onTagChange: (id: string, tagId: string | null) => void;
  onSend: (id: string) => void;
}

export function DoneItemRow({ id, text, tagId, tags, habiticaSend, isSending, sendError, onChange, onBlur, onTagChange, onSend }: DoneItemRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => onChange(id, e.target.value)}
          onBlur={() => onBlur(id)}
          className="flex-1 border border-gray-700 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
        <select
          value={tagId ?? ''}
          onChange={(e) => onTagChange(id, e.target.value || null)}
          className="border border-gray-700 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          <option value="">No tag</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        {habiticaSend ? (
          <span className="text-sm text-gray-500 px-3 py-2">Sent</span>
        ) : (
          <button
            onClick={() => onSend(id)}
            disabled={isSending}
            className="border border-gray-700 rounded px-3 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        )}
      </div>
      {sendError && (
        <p className="text-red-500 text-xs">{sendError}</p>
      )}
    </div>
  );
}