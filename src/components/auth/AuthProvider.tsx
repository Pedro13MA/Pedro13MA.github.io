"use client";

import { SessionProvider } from "@/components/auth/SessionProvider";

/** AuthProvider — raiz de identidade (Auth.js-aligned SessionProvider). */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
