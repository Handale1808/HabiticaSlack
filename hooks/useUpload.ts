// hooks/useUpload.ts

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type UploadStatus = "idle" | "loading" | "success" | "error";

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
}

interface UseUploadReturn {
  upload: (file: File, userId: string, habiticaTagId?: string | null) => Promise<void>
  reset: () => void;
  status: UploadStatus;
  doneItems: DoneItem[];
  errorMessage: string | null;
}

function fileToBase64(
  file: File,
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = file.type;
      const base64 = result.split(",")[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function stripMarkdownFences(content: string): string {
  return content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
}

export function useUpload(): UseUploadReturn {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [doneItems, setDoneItems] = useState<DoneItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const upload = async (file: File, userId: string, habiticaTagId: string | null = null) => {
    setStatus("loading");
    setDoneItems([]);
    setErrorMessage(null);

    try {
      const { base64, mimeType } = await fileToBase64(file);

      const openRouterResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "anthropic/claude-haiku-4-5",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: 'You are analysing a handwritten done list.\nReturn JSON.\n{\n  "tasks": [\n    {\n      "text": "Updated payment form"\n    }\n  ]\n}\nOnly return valid JSON.',
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${mimeType};base64,${base64}`,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!openRouterResponse.ok) {
        const errText = await openRouterResponse.text();
        throw new Error(
          `OpenRouter error: ${openRouterResponse.status} — ${errText}`,
        );
      }

      const rawAiResponse = await openRouterResponse.json();

      const storagePath = `${userId}/${Date.now()}-${file.name}`;

      const { error: storageError } = await supabase.storage
        .from("uploads")
        .upload(storagePath, file, { contentType: file.type });

      if (storageError) {
        throw new Error(`Storage error: ${storageError.message}`);
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("uploads")
          .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

      if (signedUrlError) {
        throw new Error(`Signed URL error: ${signedUrlError.message}`);
      }

      const { data: uploadData, error: dbError } = await supabase
        .from("Uploads")
        .insert({
          user_id: userId,
          image_url: signedUrlData.signedUrl,
          ai_response: rawAiResponse,
        })
        .select("id")
        .single();

      if (dbError || !uploadData) {
        throw new Error(`Database error: ${dbError?.message ?? "No data returned from Uploads insert"}`);
      }

      const rawContent: string = rawAiResponse.choices[0].message.content;
      const cleaned = stripMarkdownFences(rawContent);

      let tasks: Array<{ text: string }>;
      try {
        const parsed = JSON.parse(cleaned);
        tasks = parsed.tasks;
      } catch {
        throw new Error("Failed to parse AI response JSON");
      }

      const { data: listData, error: listError } = await supabase
        .from("Lists")
        .insert({ upload_id: uploadData.id })
        .select("id")
        .single();

      if (listError || !listData) {
        throw new Error(`Lists insert error: ${listError?.message ?? "No data returned from Lists insert"}`);
      }

      const doneItemRows = tasks.map((task) => ({
  list_id: listData.id,
  text: task.text,
  habitica_tag: habiticaTagId,
}))

      const { data: insertedItems, error: doneItemsError } = await supabase
        .from("DoneItems")
        .insert(doneItemRows)
        .select("id, text, habitica_tag, habitica_send, habitica_id");

      if (doneItemsError || !insertedItems) {
        throw new Error(`DoneItems insert error: ${doneItemsError?.message ?? "No data returned from DoneItems insert"}`);
      }

      setDoneItems(insertedItems);
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setDoneItems([]);
    setErrorMessage(null);
  };

  return { upload, reset, status, doneItems, errorMessage };
}