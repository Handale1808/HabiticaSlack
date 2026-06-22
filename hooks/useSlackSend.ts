// hooks/useSlackSend.ts

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface DoneItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
  slack_text?: string | null;
  category?: string | null;
}

export interface EnrichedItem {
  id: string;
  text: string;
  habitica_tag: string | null;
  habitica_send: boolean | null;
  habitica_id: string | null;
  category: string;
  slack_text: string;
}

export type EnrichmentStatus =
  | "idle"
  | "collecting"
  | "loading"
  | "preview"
  | "sending"
  | "success"
  | "error";

interface UseSlackSendReturn {
  triggerEnrichment: (itemsOverride?: DoneItem[], listIdOverride?: string) => Promise<void>;
  startCollecting: () => void;
  enrichedItems: EnrichedItem[];
  done: string | null;
  nextText: string | null;
  blockedText: string | null;
  availableCategories: string[];
  handleCategoryChange: (id: string, category: string) => void;
  handleDoneChange: (value: string) => void;
  handleNextTextChange: (value: string) => void;
  handleBlockedTextChange: (value: string) => void;
  doneAdditions: string;
  next: string;
  blocked: string;
  handleDoneAdditionsChange: (value: string) => void;
  handleNextChange: (value: string) => void;
  handleBlockedChange: (value: string) => void;
  confirmSend: () => Promise<void>;
  cancelPreview: () => void;
  enrichmentStatus: EnrichmentStatus;
  enrichmentError: string | null;
}

function stripMarkdownFences(content: string): string {
  return content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
}

export function useSlackSend(
  listId: string,
  items: DoneItem[],
): UseSlackSendReturn {
  const [enrichedItems, setEnrichedItems] = useState<EnrichedItem[]>([]);
  const [done, setDone] = useState<string | null>(null);
  const [nextText, setNextText] = useState<string | null>(null);
  const [blockedText, setBlockedText] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [enrichmentStatus, setEnrichmentStatus] =
    useState<EnrichmentStatus>("idle");
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null);

  const [doneAdditions, setDoneAdditions] = useState("");
  const [next, setNext] = useState("");
  const [blocked, setBlocked] = useState("");

  const startCollecting = (): void => {
    setEnrichmentStatus("collecting");
  };

  const triggerEnrichment = async (
    itemsOverride?: DoneItem[],
    listIdOverride?: string,
  ): Promise<void> => {
    const workingItems = Array.isArray(itemsOverride)
      ? itemsOverride
      : Array.isArray(items)
        ? items
        : [];
    const workingListId = listIdOverride ?? listId;
    if (workingItems.length === 0) {
      setEnrichmentError("No items to send.");
      setEnrichmentStatus("error");
      return;
    }

    setEnrichmentStatus("loading");
    setEnrichmentError(null);

    const { data: categoryRows, error: categoryError } = await supabase
      .from("DoneItems")
      .select("category")
      .not("category", "is", null);

    if (categoryError) {
      setEnrichmentError(
        `Failed to fetch categories: ${categoryError.message}`,
      );
      setEnrichmentStatus("error");
      return;
    }

    const existingCategories: string[] = [
      ...new Set(
        (categoryRows ?? [])
          .map((row: { category: string | null }) => row.category)
          .filter((c): c is string => c !== null),
      ),
    ].sort();

    const prompt = `You are categorising a done list into groups and rewriting each item as a full past-tense sentence written in the first person.

Existing categories (prefer these, do not invent new ones unless truly necessary):
${existingCategories.length > 0 ? existingCategories.map((c) => `- ${c}`).join("\n") : "None yet"}

Rules:
- Create specific, meaningful categories that describe the type of work (e.g. "Bug Fixes", "Deployments", "Implementation Plans", "UI Updates", "Backend Work"). Do not use broad catch-all labels.
- If existing categories from the list above are specific and meaningful, reuse them. Ignore any that are too broad.
- You may create new specific categories when needed.
- Rewrite each item's text as a natural full past-tense sentence in the first person (e.g. "Made an implementation plan for the integration feature" or "Fixed a bug in the login flow").
- Write a "done" paragraph (3–4 sentences) synthesising everything accomplished, written in the first person ("I fixed...", "I worked on..."). If the user provided additional done context, weave it in naturally.
- Write a "next" paragraph (1–3 sentences) from the user's next input, written in the first person. If blank, write "Nothing next."
- Write a "blocked" paragraph (1–3 sentences) from the user's blocked input, written in the first person. If blank, write "Nothing blocked."
- Return only valid JSON with no markdown fences, no preamble, no explanation.

User inputs:
- Done additions: ${doneAdditions.trim() || "(none)"}
- Next: ${next.trim() || "(none)"}
- Blocked: ${blocked.trim() || "(none)"}

JSON shape:
{
  "items": [
    { "id": "uuid-here", "category": "Implementation Plans", "slack_text": "Made an implementation plan for the integration feature." }
  ],
  "done": "I had a productive day across several areas...",
  "next": "Nothing next.",
  "blocked": "Nothing blocked."
}

Items to process:
${JSON.stringify(workingItems.map((i) => ({ id: i.id, text: i.text })))}`;

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: "anthropic/claude-haiku-4-5",
            messages: [{ role: "user", content: prompt }],
          }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter error: ${response.status} — ${errText}`);
      }

      const json = await response.json();
      const raw: string = json.choices[0].message.content;
      const cleaned = stripMarkdownFences(raw);

      let parsed: {
        items: { id: string; category: string; slack_text: string }[];
        done: string;
        next: string;
        blocked: string;
      };
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new Error("Failed to parse AI response as JSON");
      }

      if (!Array.isArray(parsed.items)) {
        throw new Error("AI response has unexpected shape");
      }

      const doneVal = typeof parsed.done === "string" ? parsed.done : "";
      const nextVal = typeof parsed.next === "string" ? parsed.next : "Nothing next.";
      const blockedVal = typeof parsed.blocked === "string" ? parsed.blocked : "Nothing blocked.";

      const enriched: EnrichedItem[] = workingItems.map((item) => {
        const aiItem = parsed.items.find((p) => p.id === item.id);
        return {
          ...item,
          category: aiItem?.category ?? "Uncategorised",
          slack_text: aiItem?.slack_text ?? item.text,
        };
      });

      supabase
        .from("Lists")
        .update({ summary: doneVal })
        .eq("id", workingListId)
        .then(({ error }) => {
          if (error) console.error("Failed to save summary:", error.message);
        });

      const newCategories = [
        ...new Set([...existingCategories, ...enriched.map((i) => i.category)]),
      ].sort();

      setEnrichedItems(enriched);
      setDone(doneVal);
      setNextText(nextVal);
      setBlockedText(blockedVal);
      setAvailableCategories(newCategories);
      setEnrichmentStatus("preview");
    } catch (err) {
      setEnrichmentError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setEnrichmentStatus("error");
    }
  };

  const handleCategoryChange = (id: string, category: string): void => {
    setEnrichedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item)),
    );
  };

  const confirmSend = async (): Promise<void> => {
    setEnrichmentStatus("sending");

    const grouped = enrichedItems.reduce<Record<string, EnrichedItem[]>>(
      (acc, item) => {
        const key = item.category;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {},
    );

    const dailyBlocks: object[] = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Done:* ${done ?? ""}\n\n*Next:* ${nextText ?? "Nothing next."}\n\n*Blocked:* ${blockedText ?? "Nothing blocked."}`,
        },
      },
    ];

    const devBlocks: object[] = [
      {
        type: "header",
        text: { type: "plain_text", text: "Done list", emoji: false },
      },
    ];

    for (const [category, categoryItems] of Object.entries(grouped)) {
      devBlocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*${category}*` },
      });
      for (const item of categoryItems) {
        devBlocks.push({
          type: "section",
          text: { type: "mrkdwn", text: `- ${item.slack_text}` },
        });
      }
    }

    try {
      const dailyResponse = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "daily", blocks: dailyBlocks }),
      });

      if (!dailyResponse.ok) {
        throw new Error(`Slack daily error: ${dailyResponse.status}`);
      }

      const devResponse = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "dev", blocks: devBlocks }),
      });

      if (!devResponse.ok) {
        throw new Error(`Slack dev error: ${devResponse.status}`);
      }

      const { error: supabaseError } = await supabase
        .from("Lists")
        .update({ slack_sent: true })
        .eq("id", listId);

      if (supabaseError) {
        throw new Error(
          `Failed to update slack_sent: ${supabaseError.message}`,
        );
      }

      setEnrichmentStatus("success");
    } catch (err) {
      setEnrichmentError(
        err instanceof Error ? err.message : "Failed to send to Slack",
      );
      setEnrichmentStatus("error");
    }
  };

  const cancelPreview = (): void => {
    setEnrichedItems([]);
    setDone(null);
    setNextText(null);
    setBlockedText(null);
    setAvailableCategories([]);
    setDoneAdditions("");
    setNext("");
    setBlocked("");
    setEnrichmentStatus("idle");
    setEnrichmentError(null);
  };

  return {
    triggerEnrichment,
    startCollecting,
    enrichedItems,
    done,
    nextText,
    blockedText,
    availableCategories,
    handleCategoryChange,
    handleDoneChange: setDone,
    handleNextTextChange: setNextText,
    handleBlockedTextChange: setBlockedText,
    doneAdditions,
    next,
    blocked,
    handleDoneAdditionsChange: setDoneAdditions,
    handleNextChange: setNext,
    handleBlockedChange: setBlocked,
    confirmSend,
    cancelPreview,
    enrichmentStatus,
    enrichmentError,
  };
}
