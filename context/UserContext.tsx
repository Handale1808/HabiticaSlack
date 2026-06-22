"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useHabiticaStats } from "@/hooks/useHabiticaStats";
import { useUserStats } from "@/hooks/useUserStats";
import type { UserStats } from "@/types/stats";

interface User {
  id: string;
  name: string;
  habitica_user_id: string;
  habitica_api_token: string;
  slack_list_webhook: string | null;
  slack_summary_webhook: string | null;
  avatar_url: string | null;
}

interface UserContextValue {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  authUser: AuthUser | null;
  isRehydrating: boolean;
  habiticaStats: ReturnType<typeof useHabiticaStats>["stats"];
  isHabiticaStatsLoading: boolean;
  habiticaStatsError: string | null;
  refreshHabiticaStats: () => void;
  userStats: UserStats | null;
  setUserStats: (s: UserStats | null) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

async function fetchProfileRow(authUid: string): Promise<User | null> {
  const { data } = await supabase
    .from("Users")
    .select(
      "id, name, habitica_user_id, habitica_api_token, slack_list_webhook, slack_summary_webhook, avatar_url",
    )
    .eq("user_id", authUid)
    .single();
  return data ?? null;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isRehydrating, setIsRehydrating] = useState(true);

  const {
    stats: habiticaStats,
    isLoading: isHabiticaStatsLoading,
    error: habiticaStatsError,
    refreshStats: refreshHabiticaStats,
  } = useHabiticaStats(
    currentUser?.habitica_user_id ?? "",
    currentUser?.habitica_api_token ?? "",
  );

  const { userStats } = useUserStats(authUser?.id ?? null);
  const [userStatsState, setUserStatsState] = useState<UserStats | null>(null);

  useEffect(() => {
    setUserStatsState(userStats);
  }, [userStats]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user && mounted) {
        setAuthUser(session.user);
        const profile = await fetchProfileRow(session.user.id);
        if (mounted) setCurrentUserState(profile);
      }

      if (mounted) setIsRehydrating(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT" || !session) {
          setAuthUser(null);
          setCurrentUserState(null);
          return;
        }

        setAuthUser(session.user);
        const profile = await fetchProfileRow(session.user.id);
        if (mounted) setCurrentUserState(profile);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authUser,
        isRehydrating,
        habiticaStats,
        isHabiticaStatsLoading,
        habiticaStatsError,
        refreshHabiticaStats,
        userStats: userStatsState,
        setUserStats: setUserStatsState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return context;
}
