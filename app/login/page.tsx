// app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldLabel } from "@/components/ui/FieldLabel";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message.toLowerCase());
      return;
    }

    router.push("/upload");
  };

  const handleSignUp = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError("passwords do not match");
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message.toLowerCase());
      return;
    }

    if (!data.session) {
      setEmailSent(true);
      return;
    }

    router.push("/profile");
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setEmailSent(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  if (emailSent) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
        <Card className="flex w-full max-w-sm flex-col gap-3">
          <h2 className="font-display text-2xl text-bark">check your inbox</h2>
          <p className="text-sm text-bark/60">
            we sent a confirmation link to <strong>{email}</strong>. click it to
            activate your account, then come back here to sign in.
          </p>
          <Button variant="secondary" onClick={() => switchMode("signin")}>
            back to sign in
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="font-display text-4xl text-bark">
        {mode === "signin" ? "welcome back" : "create account"}
      </h1>

      <Card className="flex w-full max-w-sm flex-col gap-3">
        <FieldLabel label="email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </FieldLabel>

        <FieldLabel label="password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </FieldLabel>

        {mode === "signup" && (
          <FieldLabel label="confirm password">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="confirm password"
              className="w-full rounded-lg border-2 border-bark/30 bg-parchment px-3 py-2 text-sm text-bark shadow-sm transition-colors placeholder:text-bark/40 focus:outline-none focus:ring-2 focus:ring-moss"
            />
          </FieldLabel>
        )}

        <Button
          onClick={mode === "signin" ? handleSignIn : handleSignUp}
          disabled={!email.trim() || !password}
          isLoading={isLoading}
        >
          {mode === "signin" ? "sign in" : "create account"}
        </Button>

        {error && <p className="text-sm text-berry">{error}</p>}
      </Card>

      <p className="text-sm text-bark/60">
        {mode === "signin" ? (
          <>
            no account yet?{" "}
            <button
              className="underline hover:text-bark"
              onClick={() => switchMode("signup")}
            >
              create one
            </button>
          </>
        ) : (
          <>
            already have an account?{" "}
            <button
              className="underline hover:text-bark"
              onClick={() => switchMode("signin")}
            >
              sign in
            </button>
          </>
        )}
      </p>
    </main>
  );
}
