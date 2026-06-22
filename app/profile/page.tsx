// app/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/context/UserContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";

export default function ProfilePage() {
  const { currentUser, authUser, setCurrentUser, isRehydrating } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [habiticaUserId, setHabiticaUserId] = useState("");
  const [habiticaApiToken, setHabiticaApiToken] = useState("");
  const [slackListWebhook, setSlackListWebhook] = useState("");
  const [slackSummaryWebhook, setSlackSummaryWebhook] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setHabiticaUserId(currentUser.habitica_user_id);
      setHabiticaApiToken(currentUser.habitica_api_token);
      setSlackListWebhook(currentUser.slack_list_webhook ?? "");
      setSlackSummaryWebhook(currentUser.slack_summary_webhook ?? "");
    }
  }, [currentUser]);

  useEffect(() => {
    if (!isRehydrating && !authUser) {
      router.push("/login");
    }
  }, [isRehydrating, authUser, router]);

  if (isRehydrating) return null;
  if (!authUser) return null;

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "name is required";
    if (!habiticaUserId.trim()) errors.habiticaUserId = "habitica user id is required";
    if (!habiticaApiToken.trim()) errors.habiticaApiToken = "habitica api token is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setError(null);
    setIsLoading(true);

    const payload = {
      user_id: authUser.id,
      name: name.trim(),
      habitica_user_id: habiticaUserId.trim(),
      habitica_api_token: habiticaApiToken.trim(),
      slack_list_webhook: slackListWebhook.trim() || null,
      slack_summary_webhook: slackSummaryWebhook.trim() || null,
    };

    let data, err;

    if (currentUser) {
      ({ data, error: err } = await supabase
        .from("Users")
        .update(payload)
        .eq("user_id", authUser.id)
        .select(
          "id, name, habitica_user_id, habitica_api_token, slack_list_webhook, slack_summary_webhook",
        )
        .single());
    } else {
      ({ data, error: err } = await supabase
        .from("Users")
        .insert(payload)
        .select(
          "id, name, habitica_user_id, habitica_api_token, slack_list_webhook, slack_summary_webhook",
        )
        .single());
    }

    setIsLoading(false);

    if (err) {
      setError(err.message.toLowerCase());
      return;
    }

    setCurrentUser(data);
    router.push("/upload");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="font-display text-4xl text-bark">
        {currentUser ? "edit profile" : "set up your profile"}
      </h1>

      <Card className="flex w-full max-w-sm flex-col gap-3">
        <FieldLabel label="your name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            className={`w-full rounded-lg border-2 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss ${fieldErrors.name ? "border-berry" : "border-bark/30"}`}
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-berry">{fieldErrors.name}</p>}
        </FieldLabel>

        <FieldLabel label="habitica user id">
          <input
            type="text"
            value={habiticaUserId}
            onChange={(e) => setHabiticaUserId(e.target.value)}
            placeholder="habitica user id"
            className={`w-full rounded-lg border-2 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss ${fieldErrors.habiticaUserId ? "border-berry" : "border-bark/30"}`}
          />
          {fieldErrors.habiticaUserId && <p className="mt-1 text-xs text-berry">{fieldErrors.habiticaUserId}</p>}
        </FieldLabel>

        <FieldLabel label="habitica api token">
          <input
            type="password"
            value={habiticaApiToken}
            onChange={(e) => setHabiticaApiToken(e.target.value)}
            placeholder="habitica api token"
            className={`w-full rounded-lg border-2 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss ${fieldErrors.habiticaApiToken ? "border-berry" : "border-bark/30"}`}
          />
          {fieldErrors.habiticaApiToken && <p className="mt-1 text-xs text-berry">{fieldErrors.habiticaApiToken}</p>}
        </FieldLabel>

        <FieldLabel label="slack list webhook (optional)">
          <input
            type="text"
            value={slackListWebhook}
            onChange={(e) => setSlackListWebhook(e.target.value)}
            placeholder="https://hooks.slack.com/..."
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </FieldLabel>

        <FieldLabel label="slack summary webhook (optional)">
          <input
            type="text"
            value={slackSummaryWebhook}
            onChange={(e) => setSlackSummaryWebhook(e.target.value)}
            placeholder="https://hooks.slack.com/..."
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </FieldLabel>

        <Button onClick={handleSubmit} isLoading={isLoading}>
          {currentUser ? "save changes" : "save and continue"}
        </Button>

        {error && <p className="text-sm text-berry">{error}</p>}
      </Card>
    </main>
  );
}
