"use client";

import { EnrichedItem, EnrichmentStatus } from "@/hooks/useSlackSend";
import { SlackPreview } from "@/components/SlackPreview";
import { Button } from "@/components/ui/Button";

interface SlackSendBlockProps {
  enrichmentStatus: EnrichmentStatus;
  enrichedItems: EnrichedItem[];
  done: string | null;
  nextText: string | null;
  blockedText: string | null;
  availableCategories: string[];
  onCategoryChange: (id: string, category: string) => void;
  onDoneChange: (value: string) => void;
  onNextTextChange: (value: string) => void;
  onBlockedTextChange: (value: string) => void;
  doneAdditions: string;
  next: string;
  blocked: string;
  onDoneAdditionsChange: (value: string) => void;
  onNextChange: (value: string) => void;
  onBlockedChange: (value: string) => void;
  onStartCollecting: () => void;
  onTrigger: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  sendError: string | null;
  disabled?: boolean;
}

export function SlackSendBlock({
  enrichmentStatus,
  enrichedItems,
  done,
  nextText,
  blockedText,
  availableCategories,
  onCategoryChange,
  onDoneChange,
  onNextTextChange,
  onBlockedTextChange,
  doneAdditions,
  next,
  blocked,
  onDoneAdditionsChange,
  onNextChange,
  onBlockedChange,
  onStartCollecting,
  onTrigger,
  onConfirm,
  onCancel,
  sendError,
  disabled = false,
}: SlackSendBlockProps) {
  return (
    <>
      {enrichmentStatus === "idle" || enrichmentStatus === "error" ? (
        <Button
          variant="secondary"
          onClick={onStartCollecting}
          disabled={disabled}
        >
          send to Slack
        </Button>
      ) : enrichmentStatus === "loading" ? (
        <Button variant="secondary" disabled isLoading>
          gathering your list...
        </Button>
      ) : enrichmentStatus === "success" ? (
        <Button variant="secondary" disabled>
          sent to Slack
        </Button>
      ) : null}

      {enrichmentStatus === "collecting" && (
        <div className="flex flex-col gap-3 rounded-xl border-2 border-bark/20 bg-parchment p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-bark/60">
              Anything to add to your summary?
            </label>
            <textarea
              value={doneAdditions}
              onChange={(e) => onDoneAdditionsChange(e.target.value)}
              rows={2}
              placeholder="optional"
              className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm focus:outline-none focus:ring-2 focus:ring-moss resize-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-bark/60">
              What are you working on next?
            </label>
            <textarea
              value={next}
              onChange={(e) => onNextChange(e.target.value)}
              rows={2}
              placeholder="optional"
              className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm focus:outline-none focus:ring-2 focus:ring-moss resize-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-bark/60">
              Blocked on anything?
            </label>
            <textarea
              value={blocked}
              onChange={(e) => onBlockedChange(e.target.value)}
              rows={2}
              placeholder="optional"
              className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm focus:outline-none focus:ring-2 focus:ring-moss resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onTrigger}>Continue</Button>
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(enrichmentStatus === "preview" ||
        enrichmentStatus === "sending" ||
        enrichmentStatus === "error") &&
        enrichedItems.length > 0 &&
        done !== null && (
          <SlackPreview
            enrichedItems={enrichedItems}
            done={done}
            next={nextText ?? ""}
            blocked={blockedText ?? ""}
            availableCategories={availableCategories}
            onCategoryChange={onCategoryChange}
            onDoneChange={onDoneChange}
            onNextChange={onNextTextChange}
            onBlockedChange={onBlockedTextChange}
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
          off it goes — sent to Slack.
        </p>
      )}
    </>
  );
}
