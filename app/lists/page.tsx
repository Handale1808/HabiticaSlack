"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface ListRow {
  id: string;
  created_at: string;
}

export default function ListsPage() {
  const [lists, setLists] = useState<ListRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("Lists")
        .select("id, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      setLists(data ?? []);
      setIsLoading(false);
    };

    fetchLists();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Your lists</h1>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!isLoading && !error && lists.length === 0 && (
        <p className="text-sm text-gray-500">
          No lists yet. Upload a done list to get started.
        </p>
      )}

      {!isLoading && lists.length > 0 && (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => router.push(`/lists/${list.id}`)}
              className="border border-gray-700 rounded px-4 py-3 text-sm text-left hover:bg-gray-900 transition-colors"
            >
              {new Date(list.created_at).toLocaleString("en-ZA", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
