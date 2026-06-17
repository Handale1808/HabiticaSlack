import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fileToBase64, stripMarkdownFences } from "@/lib/uploadUtils";

type AppendStatus = "idle" | "loading" | "success" | "error";

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
}

interface UseAppendUploadReturn {
  appendUpload: (
    file: File,
    userId: string,
    listId: string,
    habiticaTagId?: string | null,
  ) => Promise<DoneItem[]>;
  status: AppendStatus;
  errorMessage: string | null;
}

export function useAppendUpload(): UseAppendUploadReturn {
  const [status, setStatus] = useState<AppendStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const appendUpload = async (
    file: File,
    userId: string,
    listId: string,
    habiticaTagId: string | null = null,
  ): Promise<DoneItem[]> => {
    setStatus("loading");
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

      const { error: dbError } = await supabase
        .from("Uploads")
        .insert({
          user_id: userId,
          image_url: signedUrlData.signedUrl,
          ai_response: rawAiResponse,
        });

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
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

      if (!Array.isArray(tasks) || tasks.length === 0) {
        throw new Error("No tasks found in image");
      }

      const doneItemRows = tasks.map((task) => ({
        list_id: listId,
        text: task.text,
        habitica_tag: habiticaTagId,
      }));

      const { data: insertedItems, error: doneItemsError } = await supabase
        .from("DoneItems")
        .insert(doneItemRows)
        .select("id, text, habitica_tag, habitica_send, habitica_id");

      if (doneItemsError || !insertedItems) {
        throw new Error(
          `DoneItems insert error: ${doneItemsError?.message ?? "No data returned"}`,
        );
      }

      setStatus("success");
      return insertedItems;
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setStatus("error");
      return [];
    }
  };

  return { appendUpload, status, errorMessage };
}