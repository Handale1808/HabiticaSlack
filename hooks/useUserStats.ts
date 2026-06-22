import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { UserStats } from "@/types/stats";

export function useUserStats(userId: string | null): {
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;
} {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserStats(null);
      return;
    }

    let mounted = true;
    setIsLoading(true);

    const fetch = async () => {
      const { data: statsRow, error: statsErr } = await supabase
        .from("UserStats")
        .select("user_id, level, acorns, wonder, magic")
        .eq("user_id", userId)
        .single();

      if (!mounted) return;

      if (statsErr || !statsRow) {
        if (statsErr?.code !== "PGRST116") {
          setError(statsErr?.message ?? "failed to load stats");
        }
        setIsLoading(false);
        return;
      }

      const { data: levelRow, error: levelErr } = await supabase
        .from("Levels")
        .select("max_wonder, max_magic")
        .eq("level", statsRow.level)
        .single();

      if (!mounted) return;

      if (levelErr || !levelRow) {
        setError(levelErr?.message ?? "failed to load level config");
        setIsLoading(false);
        return;
      }

      setUserStats({
        ...statsRow,
        maxWonder: levelRow.max_wonder,
        maxMagic: levelRow.max_magic,
      });
      setError(null);
      setIsLoading(false);
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return { userStats, isLoading, error };
}
