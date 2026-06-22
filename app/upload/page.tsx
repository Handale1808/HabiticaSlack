// app/upload/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUpload } from "@/hooks/useUpload";
import { useUser } from "@/context/UserContext";
import { useDoneItems } from "@/hooks/useDoneItems";
import { DoneItemRow } from "@/components/DoneItemRow";
import { useHabiticaTags } from "@/hooks/useHabiticaTags";
import { useHabiticaSend } from "@/hooks/useHabiticaSend";
import { useSlackSend } from "@/hooks/useSlackSend";
import { SendAllButton } from "@/components/SendAllButton";
import { SlackSendBlock } from "@/components/SlackSendBlock";
import { UploadForm } from "@/components/UploadForm";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DecorativeAsset } from "@/components/decorative/DecorativeAsset";

export default function UploadPage() {
  const { upload, reset, status, doneItems, listId, errorMessage } =
    useUpload();
  const { currentUser, authUser, isRehydrating } = useUser();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => new Date(),
  );

  const {
    tags,
    createTag,
    isLoading: tagsLoading,
    createLoading,
    error: tagsError,
  } = useHabiticaTags(
    currentUser?.habitica_user_id ?? "",
    currentUser?.habitica_api_token ?? "",
  );

  const {
    items,
    handleTextChange,
    handleBlur,
    handleTagChange,
    markAsSent,
    updateStatus,
    updateError,
  } = useDoneItems(doneItems);

  const { sendItem, sendingIds, sendErrors } = useHabiticaSend(
    currentUser?.habitica_user_id ?? "",
    currentUser?.habitica_api_token ?? "",
    markAsSent,
  );

  const {
    triggerEnrichment,
    startCollecting,
    enrichedItems,
    done,
    nextText,
    blockedText,
    availableCategories,
    handleCategoryChange,
    handleDoneChange,
    handleNextTextChange,
    handleBlockedTextChange,
    doneAdditions,
    next,
    blocked,
    handleDoneAdditionsChange,
    handleNextChange,
    handleBlockedChange,
    confirmSend,
    cancelPreview,
    enrichmentStatus,
    enrichmentError,
  } = useSlackSend(listId ?? "", items);

  useEffect(() => {
    if (isRehydrating) return;
    if (!authUser) return; // middleware handles this; guard against brief client gap
    if (!currentUser) router.push("/profile");
  }, [currentUser, authUser, isRehydrating, router]);

  if (isRehydrating) return null;
  if (!currentUser) return null;

  const handleReset = () => {
    reset();
  };

 return (
    <main className="relative flex min-h-screen flex-col items-center gap-8 overflow-hidden p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden justify-between px-6 sm:flex">
        <DecorativeAsset slot="tree-border-left" aspectRatio="1 / 1" className="w-28" />
        <DecorativeAsset slot="tree-border-right" aspectRatio="1 / 1" className="w-28" />
      </div>

      <div className="flex w-full max-w-sm justify-end">
        <Button variant="ghost" onClick={() => router.push("/lists")}>
          new list
        </Button>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-4xl text-bark">upload your done list</h1>
        <p className="text-sm text-bark/60">welcome back, <strong>{currentUser.name}</strong></p>
      </div>

      <AnimatePresence mode="wait">
        {status !== "success" ? (
          <motion.div
            key="upload-form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm"
          >
            <UploadForm
              tags={tags}
              createTag={createTag}
              tagsLoading={tagsLoading}
              createLoading={createLoading}
              tagsError={tagsError}
              onUpload={(file, tagId, completedAt) =>
                upload(file, currentUser.id, tagId, completedAt)
              }
              isLoading={status === "loading"}
              error={errorMessage}
              showDateField
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </motion.div>
        ) : (
          <motion.div
            key="done-items"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex w-full max-w-lg flex-col gap-4"
          >
            <Card className="flex flex-col gap-3">
              {items.map((item) => (
                <DoneItemRow
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  tagId={item.habitica_tag}
                  tags={tags}
                  habiticaSend={item.habitica_send}
                  isSending={sendingIds.has(item.id)}
                  sendError={sendErrors[item.id] ?? null}
                  onChange={handleTextChange}
                  onBlur={handleBlur}
                  onTagChange={handleTagChange}
                  onSend={(id) => {
                    const found = items.find((i) => i.id === id);
                    if (found) sendItem(found);
                  }}
                />
              ))}

              <AnimatePresence>
                {updateStatus === "saving" && (
                  <motion.p
                    key="saving"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-bark/60"
                  >
                    tucking that change in...
                  </motion.p>
                )}
              </AnimatePresence>

              {updateStatus === "error" && (
                <p className="text-sm text-berry">{updateError?.toLowerCase()}</p>
              )}
            </Card>

            <Button variant="secondary" onClick={handleReset}>
              upload another list
            </Button>

            <SendAllButton items={items} sendItem={sendItem} />

            {(currentUser.slack_list_webhook || currentUser.slack_summary_webhook) && (
              <SlackSendBlock
                enrichmentStatus={enrichmentStatus}
                enrichedItems={enrichedItems}
                done={done}
                nextText={nextText}
                blockedText={blockedText}
                availableCategories={availableCategories}
                onCategoryChange={handleCategoryChange}
                onDoneChange={handleDoneChange}
                onNextTextChange={handleNextTextChange}
                onBlockedTextChange={handleBlockedTextChange}
                doneAdditions={doneAdditions}
                next={next}
                blocked={blocked}
                onDoneAdditionsChange={handleDoneAdditionsChange}
                onNextChange={handleNextChange}
                onBlockedChange={handleBlockedChange}
                onStartCollecting={startCollecting}
                onTrigger={triggerEnrichment}
                onConfirm={confirmSend}
                onCancel={cancelPreview}
                sendError={enrichmentError}
                disabled={!listId}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <DecorativeAsset
        slot="rabbit-peek"
        aspectRatio="4 / 3"
        className="w-40 sm:absolute sm:bottom-4 sm:right-6"
      />
    </main>
  );
}
