// app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/useLogin";
import { useUser } from "@/context/UserContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";

export default function LoginPage() {
  const [nameInput, setNameInput] = useState("");
  const [habiticaUserIdInput, setHabiticaUserIdInput] = useState("");
  const [habiticaApiTokenInput, setHabiticaApiTokenInput] = useState("");

  const [credentialPromptUserId, setCredentialPromptUserId] = useState<
    string | null
  >(null);
  const [promptHabiticaUserId, setPromptHabiticaUserId] = useState("");
  const [promptHabiticaApiToken, setPromptHabiticaApiToken] = useState("");

  const {
    createUser,
    updateUserCredentials,
    existingUsers,
    isLoading,
    error,
    updateLoading,
    updateError,
  } = useLogin();
  const { setCurrentUser } = useUser();
  const router = useRouter();

  const handleCreate = async () => {
    if (
      !nameInput.trim() ||
      !habiticaUserIdInput.trim() ||
      !habiticaApiTokenInput.trim()
    )
      return;
    const user = await createUser(
      nameInput.trim(),
      habiticaUserIdInput.trim(),
      habiticaApiTokenInput.trim(),
    );
    if (user) {
      setCurrentUser(user);
      router.push("/upload");
    }
  };

  const handleSelectUser = (user: {
    id: string;
    name: string;
    habitica_user_id: string;
    habitica_api_token: string;
  }) => {
    if (user.habitica_user_id && user.habitica_api_token) {
      setCurrentUser(user);
      router.push("/upload");
    } else {
      setCredentialPromptUserId(user.id);
    }
  };

  const handleCredentialSubmit = async (userId: string) => {
    if (!promptHabiticaUserId.trim() || !promptHabiticaApiToken.trim()) return;
    const updated = await updateUserCredentials(
      userId,
      promptHabiticaUserId.trim(),
      promptHabiticaApiToken.trim(),
    );
    if (updated) {
      setCurrentUser(updated);
      router.push("/upload");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="font-display text-4xl text-bark">Who are you?</h1>

      <Card className="flex w-full max-w-sm flex-col gap-3">
        <FieldLabel label="Your name">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </FieldLabel>
        <FieldLabel label="Habitica user ID">
          <input
            type="text"
            value={habiticaUserIdInput}
            onChange={(e) => setHabiticaUserIdInput(e.target.value)}
            placeholder="Habitica User ID"
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </FieldLabel>
        <FieldLabel label="Habitica API token">
          <input
            type="password"
            value={habiticaApiTokenInput}
            onChange={(e) => setHabiticaApiTokenInput(e.target.value)}
            placeholder="Habitica API Token"
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </FieldLabel>
        <Button
          onClick={handleCreate}
          disabled={
            !nameInput.trim() ||
            !habiticaUserIdInput.trim() ||
            !habiticaApiTokenInput.trim()
          }
          isLoading={isLoading}
        >
          create and login
        </Button>
        {error && <p className="text-sm text-berry">{error.toLowerCase()}</p>}
      </Card>

      {existingUsers.length > 0 && (
        <div className="flex w-full max-w-sm flex-col gap-2">
          <p className="text-sm text-bark/60">or continue as:</p>
          {existingUsers.map((user) => (
            <div key={user.id} className="flex flex-col gap-2">
              <button
                onClick={() => handleSelectUser(user)}
                className="rounded-lg border-2 border-bark/20 bg-parchment px-4 py-2 text-left text-sm text-bark shadow-sm transition-colors hover:border-bark/40 hover:bg-parchment-dark"
              >
                {user.name}
              </button>

              {credentialPromptUserId === user.id && (
                <Card className="flex flex-col gap-2 border-l-4 border-l-moss">
                  <p className="text-xs text-bark/60">
                    enter habitica credentials for {user.name}:
                  </p>
                  <input
                    type="text"
                    value={promptHabiticaUserId}
                    onChange={(e) => setPromptHabiticaUserId(e.target.value)}
                    placeholder="habitica user id"
                    className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
                  />
                  <input
                    type="password"
                    value={promptHabiticaApiToken}
                    onChange={(e) => setPromptHabiticaApiToken(e.target.value)}
                    placeholder="habitica api token"
                    className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleCredentialSubmit(user.id)}
                    disabled={
                      !promptHabiticaUserId.trim() ||
                      !promptHabiticaApiToken.trim()
                    }
                    isLoading={updateLoading}
                  >
                    save and login
                  </Button>
                  {updateError && (
                    <p className="text-xs text-berry">{updateError.toLowerCase()}</p>
                  )}
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
