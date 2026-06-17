"use client";

import { EnrichedItem } from "@/hooks/useSlackSend";
import { SlackPreview } from "@/components/SlackPreview";

interface SlackSendBlockProps {
  enrichmentStatus: "idle" | "loading" | "preview" | "sending" | "success" | "error";
  enrichedItems: EnrichedItem[];
  summary: string | null;
  availableCategories: string[];
  onCategoryChange: (id: string, category: string) => void;
  onTrigger: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  sendError: string | null;
  disabled?: boolean;
}

export function SlackSendBlock({
  enrichmentStatus,
  enrichedItems,
  summary,
  availableCategories,
  onCategoryChange,
  onTrigger,
  onConfirm,
  onCancel,
  sendError,
  disabled = false,
}: SlackSendBlockProps) {
  return (
    <>
      <button
        onClick={onTrigger}
        disabled={
          disabled ||
          enrichmentStatus === "loading" ||
          enrichmentStatus === "success"
        }
        className="border border-gray-700 rounded px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-900 transition-colors"
      >
        {enrichmentStatus === "loading"
          ? "Preparing..."
          : enrichmentStatus === "success"
            ? "Sent to Slack"
            : "Send to Slack"}
      </button>

      {(enrichmentStatus === "preview" ||
        enrichmentStatus === "sending" ||
        enrichmentStatus === "error") &&
        enrichedItems.length > 0 &&
        summary && (
          <SlackPreview
            enrichedItems={enrichedItems}
            summary={summary}
            availableCategories={availableCategories}
            onCategoryChange={onCategoryChange}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isSending={enrichmentStatus === "sending"}
            sendError={sendError}
          />
        )}

      {enrichmentStatus === "success" && (
        <p className="text-gray-500 text-sm">Successfully sent to Slack.</p>
      )}
    </>
  );
}