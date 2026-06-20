import { format, parseISO } from "date-fns";
import { EnrichedItem } from "@/hooks/useSlackSend";
import { CompletedDateEditor } from "@/components/CompletedDateEditor";
import { TrainingToggle } from "@/components/TrainingToggle";
import { SlackPreview } from "@/components/SlackPreview";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ListRow {
  id: string;
  created_at: string;
  completed_at: string | null;
  slack_sent: boolean | null;
  use_for_training: boolean;
}

interface ListCardProps {
  list: ListRow;
  isActive: boolean;
  slackItemsLoading: boolean;
  slackItemsError: string | null;
  enrichmentStatus: "idle" | "loading" | "preview" | "sending" | "success" | "error";
  enrichedItems: EnrichedItem[];
  summary: string | null;
  availableCategories: string[];
  enrichmentError: string | null;
  onOpen: () => void;
  onSlackClick: () => void;
  onCategoryChange: (id: string, category: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onCompletedAtChange: (date: Date | null) => void;
  onTrainingChange: (next: boolean) => void;
}

export function ListCard({
  list,
  isActive,
  slackItemsLoading,
  slackItemsError,
  enrichmentStatus,
  enrichedItems,
  summary,
  availableCategories,
  enrichmentError,
  onOpen,
  onSlackClick,
  onCategoryChange,
  onConfirm,
  onCancel,
  onCompletedAtChange,
  onTrainingChange,
}: ListCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex flex-col items-start gap-1 rounded-lg text-left transition-colors hover:text-moss-dark"
      >
        <span className="font-display text-2xl text-bark">
          {list.completed_at
            ? format(parseISO(list.completed_at), "d MMMM yyyy").toLowerCase()
            : "no completion date set"}
        </span>
        <span className="text-xs text-bark/50">
          created{" "}
          {new Date(list.created_at).toLocaleString("en-ZA", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).toLowerCase()}
        </span>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bark/15 pt-3">
        <div className="flex items-center gap-4">
          <CompletedDateEditor
            listId={list.id}
            value={list.completed_at ? parseISO(list.completed_at) : null}
            onChange={onCompletedAtChange}
          />
          <TrainingToggle
            listId={list.id}
            value={list.use_for_training}
            onChange={onTrainingChange}
          />
        </div>

        {list.slack_sent ? (
          <Button variant="shiny">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            sent
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={onSlackClick}
            disabled={
              slackItemsLoading ||
              (isActive &&
                (enrichmentStatus === "loading" ||
                  enrichmentStatus === "sending" ||
                  enrichmentStatus === "success"))
            }
            isLoading={isActive && enrichmentStatus === "loading"}
          >
            {isActive && enrichmentStatus === "loading" ? "preparing..." : "send to slack"}
          </Button>
        )}
      </div>

      {isActive && slackItemsError && (
        <p className="text-xs text-berry">{slackItemsError}</p>
      )}

      {isActive &&
        (enrichmentStatus === "preview" ||
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
            sendError={enrichmentError}
          />
        )}

      {isActive && enrichmentStatus === "success" && (
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
          off it goes — sent to slack.
        </p>
      )}
    </Card>
  );
}