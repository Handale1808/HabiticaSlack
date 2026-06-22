import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/context/UserContext";

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 5,
): Promise<Response> {
  let delay = 2000
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options)
    if (response.status !== 429 || attempt === maxRetries) return response
    await new Promise((resolve) => setTimeout(resolve, delay))
    delay *= 2
  }
  // unreachable but satisfies TS
  return fetch(url, options)
}

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
}

interface UseHabiticaSendReturn {
  sendItem: (item: DoneItem) => Promise<void>;
  sendingIds: Set<string>;
  sendErrors: Record<string, string>;
}

export function useHabiticaSend(
  habiticaUserId: string,
  habiticaApiToken: string,
  onSent: (id: string, habiticaId: string) => void,
): UseHabiticaSendReturn {
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [sendErrors, setSendErrors] = useState<Record<string, string>>({});
  const { refreshHabiticaStats } = useUser();

  const sendItem = async (item: DoneItem): Promise<void> => {
    setSendingIds((prev) => new Set(prev).add(item.id));
    setSendErrors((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });

    const headers = {
      "Content-Type": "application/json",
      "x-api-user": habiticaUserId,
      "x-api-key": habiticaApiToken,
      "x-client": `${habiticaUserId}-habiticaslack`,
    };

    try {
      const createResponse = await fetchWithRetry(
        "https://habitica.com/api/v3/tasks/user",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            type: "todo",
            text: item.text,
            tags: item.habitica_tag ? [item.habitica_tag] : [],
          }),
        },
      );

      if (!createResponse.ok) {
        throw new Error(`Habitica error: ${createResponse.status}`);
      }

      const createJson = await createResponse.json();
      const habiticaTaskId: string = createJson.data.id;

      const scoreResponse = await fetchWithRetry(
        `https://habitica.com/api/v3/tasks/${habiticaTaskId}/score/up`,
        {
          method: "POST",
          headers,
        },
      );

      if (!scoreResponse.ok) {
        throw new Error(
          `Habitica score error: ${scoreResponse.status} — task was created in Habitica but could not be marked complete`,
        );
      }

      const { error: supabaseError } = await supabase
        .from("DoneItems")
        .update({ habitica_send: true, habitica_id: habiticaTaskId })
        .eq("id", item.id);

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      onSent(item.id, habiticaTaskId);
      refreshHabiticaStats();
    } catch (err) {
      setSendErrors((prev) => ({
        ...prev,
        [item.id]: err instanceof Error ? err.message : "Failed to send to Habitica",
      }));
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  return { sendItem, sendingIds, sendErrors };
}