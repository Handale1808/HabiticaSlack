"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/hooks/useUpload";
import { useUser } from "@/context/UserContext";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { upload, reset, status, aiResponse, errorMessage } = useUpload();
  const { currentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    upload(selectedFile, currentUser.id);
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Upload your done list</h1>
      <p className="text-sm text-gray-500">Logged in as {currentUser.name}</p>

      {status !== "success" && (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || status === "loading"}
            className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {status === "loading" ? "Uploading..." : "Upload"}
          </button>
          {status === "error" && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col gap-4 w-full max-w-2xl">
          <pre className="bg-gray-900 text-green-400 rounded p-4 text-xs overflow-auto whitespace-pre-wrap break-words">
            {JSON.stringify(aiResponse, null, 2)}
          </pre>
          <button
            onClick={handleReset}
            className="bg-black text-white rounded px-4 py-2 text-sm"
          >
            Upload another
          </button>
        </div>
      )}
    </main>
  );
}
