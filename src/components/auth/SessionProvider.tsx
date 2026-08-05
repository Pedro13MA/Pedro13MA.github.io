"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchSession,
  logoutRemote,
  setStoredToken,
  startOAuthLogin,
} from "@/lib/auth/session";
import type { AuthStatus, LymiarSession, LymiarUser } from "@/lib/auth/types";
import type { AuthProviderId } from "@/auth.config";

type SessionContextValue = {
  data: LymiarSession | null;
  status: AuthStatus;
  user: LymiarUser | null;
  refresh: () => Promise<void>;
  signIn: (provider: AuthProviderId) => void;
  signOut: () => Promise<void>;
  acceptToken: (token: string) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LymiarSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const session = await fetchSession();
      setData(session);
      setStatus(session.authenticated ? "authenticated" : "unauthenticated");
    } catch {
      setData({ authenticated: false, user: null });
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback((provider: AuthProviderId) => {
    startOAuthLogin(provider);
  }, []);

  const signOut = useCallback(async () => {
    await logoutRemote();
    setData({ authenticated: false, user: null });
    setStatus("unauthenticated");
  }, []);

  const acceptToken = useCallback(
    async (token: string) => {
      setStoredToken(token);
      await refresh();
    },
    [refresh],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      data,
      status,
      user: data?.user ?? null,
      refresh,
      signIn,
      signOut,
      acceptToken,
    }),
    [data, status, refresh, signIn, signOut, acceptToken],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
