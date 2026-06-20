"use client";

import { EnrichedItem } from "@/hooks/useSlackSend";
import { SlackPreview } from "@/components/SlackPreview";
import { Button } from "@/components/ui/Button";

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
      <Button
        variant="secondary"
        onClick={onTrigger}
        disabled={disabled || enrichmentStatus === "success"}
        isLoading={enrichmentStatus === "loading"}
      >
        {enrichmentStatus === "success"
          ? "Sent to Slack"
          : enrichmentStatus === "loading"
            ? "Gathering your list..."
            : "Send to Slack"}
      </Button>

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
        <p className="flex items-center gap-1.5 text-sm text-moss-dark">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
          Off it goes — sent to Slack.
        </p>
      )}
    </>
  );
}