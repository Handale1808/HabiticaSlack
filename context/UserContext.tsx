// context/UserContext.tsx

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface User {
  id: string;
  name: string;
  habitica_user_id: string;
  habitica_api_token: string;
}

interface UserContextValue {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  isRehydrating: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = "current_user";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isRehydrating, setIsRehydrating] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          typeof parsed.id === "string" &&
          parsed.id &&
          typeof parsed.name === "string" &&
          parsed.name &&
          typeof parsed.habitica_user_id === "string" &&
          parsed.habitica_user_id &&
          typeof parsed.habitica_api_token === "string" &&
          parsed.habitica_api_token
        ) {
          setCurrentUserState(parsed);
        }
      }
    } catch {
      // invalid or missing storage value — proceed as logged out
    } finally {
      setIsRehydrating(false);
    }
  }, []);

  const setCurrentUser = useCallback((user: User) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // storage write failed — session will not persist
    }
    setCurrentUserState(user);
  }, []);

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, isRehydrating }}
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
