import { useState, useEffect, useRef } from "react";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onFileSelect: (file: File) => void;
}

export function AvatarUpload({ currentAvatarUrl, onFileSelect }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const displayUrl = previewUrl ?? currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-bark/30 bg-parchment/30 flex items-center justify-center shrink-0">
        {displayUrl ? (
          <img src={displayUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            className="text-bark/30"
            aria-hidden="true"
          >
            <circle cx="20" cy="15" r="8" stroke="currentColor" strokeWidth="2" />
            <path
              d="M4 38c0-8.837 7.163-16 16-16s16 7.163 16 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs rounded-full px-3 py-1 border border-bark/30 text-bark/70 hover:bg-parchment/40 transition-colors"
      >
        {displayUrl ? "change avatar" : "upload avatar"}
      </button>
    </div>
  );
}
