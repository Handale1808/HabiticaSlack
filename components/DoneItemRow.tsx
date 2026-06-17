// components/DoneItemRow.tsx

interface DoneItemRowProps {
  id: string;
  text: string;
  onChange: (id: string, text: string) => void;
  onBlur: (id: string) => void;
}

export function DoneItemRow({ id, text, onChange, onBlur }: DoneItemRowProps) {
  return (
    <input
      type="text"
      value={text}
      onChange={(e) => onChange(id, e.target.value)}
      onBlur={() => onBlur(id)}
      className="w-full border border-gray-700 rounded px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-500"
    />
  );
}