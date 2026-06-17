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

type EnrichmentStatus =
  | "idle"
  | "loading"
  | "preview"
  | "sending"
  | "success"
  | "error";

interface UseSlackSendReturn {
triggerEnrichment: (itemsOverride?: DoneItem[], listIdOverride?: string) => Promise<void>;
  enrichedItems: EnrichedItem[];
  summary: string | null;
  availableCategories: string[];
  handleCategoryChange: (id: string, category: string) => void;
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
  const [summary, setSummary] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [enrichmentStatus, setEnrichmentStatus] =
    useState<EnrichmentStatus>("idle");
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null);

const triggerEnrichment = async (
  itemsOverride?: DoneItem[],
  listIdOverride?: string,
): Promise<void> => {
  const workingListId = listIdOverride ?? listId;
    const workingItems = Array.isArray(itemsOverride)
      ? itemsOverride
      : Array.isArray(items)
        ? items
        : [];
    if (workingItems.length === 0) {
      setEnrichmentError("No items to send.");
      setEnrichmentStatus("error");
      return;
    }

    const allEnriched = workingItems.every(
      (item) => item.slack_text && item.category,
    );

    if (allEnriched) {
      const { data: summaryData } = await supabase
        .from("Lists")
        .select("summary")
        .eq("id", workingListId)
        .single();

      if (summaryData?.summary) {
        const { data: categoryRows } = await supabase
          .from("DoneItems")
          .select("category")
          .not("category", "is", null);

        const existingCategories: string[] = [
          ...new Set(
            (categoryRows ?? [])
              .map((row: { category: string | null }) => row.category)
              .filter((c): c is string => c !== null),
          ),
        ].sort();

        setEnrichedItems(
          workingItems.map((item) => ({
            ...item,
            category: item.category!,
            slack_text: item.slack_text!,
          })),
        );
        setSummary(summaryData.summary);
        setAvailableCategories(existingCategories);
        setEnrichmentStatus("preview");
        return;
      }
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

    const prompt = `You are categorising a done list into groups and rewriting each item as a full past-tense sentence.

Existing categories (prefer these, do not invent new ones unless truly necessary):
${existingCategories.length > 0 ? existingCategories.map((c) => `- ${c}`).join("\n") : "None yet"}

Rules:
- Create specific, meaningful categories that describe the type of work (e.g. "Bug Fixes", "Deployments", "Implementation Plans", "UI Updates", "Backend Work"). Do not use broad catch-all labels.
- If existing categories from the list above are specific and meaningful, reuse them. Ignore any that are too broad.
- You may create new specific categories when needed.
- Rewrite each item's text as a natural full past-tense sentence (e.g. "Made an implementation plan for the integration feature").
- Write a 3 to 4 sentence summary of everything accomplished across all items.
- Return only valid JSON with no markdown fences, no preamble, no explanation.

JSON shape:
{
  "items": [
    { "id": "uuid-here", "category": "Implementation Plans", "slack_text": "Made an implementation plan for the integration feature." }
  ],
  "summary": "Today was productive across several areas..."
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
        summary: string;
      };
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        throw new Error("Failed to parse AI response as JSON");
      }

      if (!Array.isArray(parsed.items) || typeof parsed.summary !== "string") {
        throw new Error("AI response has unexpected shape");
      }

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
        .update({ summary: parsed.summary })
        .eq("id", workingListId)
        .then(({ error }) => {
          if (error) console.error("Failed to save summary:", error.message);
        });

      const newCategories = [
        ...new Set([...existingCategories, ...enriched.map((i) => i.category)]),
      ].sort();

      setEnrichedItems(enriched);
      setSummary(parsed.summary);
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

    const blocks: object[] = [
      {
        type: "header",
        text: { type: "plain_text", text: "Done list", emoji: false },
      },
    ];

    for (const [category, categoryItems] of Object.entries(grouped)) {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `*${category}*` },
      });
      for (const item of categoryItems) {
        blocks.push({
          type: "section",
          text: { type: "mrkdwn", text: `- ${item.slack_text}` },
        });
      }
    }

    blocks.push({ type: "divider" });

    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: summary ?? "" },
    });

    try {
      console.log(
        "sending to /api/slack",
        JSON.stringify({ blocks }).slice(0, 200),
      );
      const slackResponse = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });

      if (!slackResponse.ok) {
        throw new Error(`Slack error: ${slackResponse.status}`);
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
    setSummary(null);
    setAvailableCategories([]);
    setEnrichmentStatus("idle");
    setEnrichmentError(null);
  };

  return {
    triggerEnrichment,
    enrichedItems,
    summary,
    availableCategories,
    handleCategoryChange,
    confirmSend,
    cancelPreview,
    enrichmentStatus,
    enrichmentError,
  };
}
