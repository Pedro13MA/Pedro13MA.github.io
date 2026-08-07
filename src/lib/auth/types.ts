/** Tipos de identidade Lymiar — espelham o User do Hub (FASE 8.0 + role). */

import type { UserRole } from "@/lib/auth/roles";

export type LymiarUser = {
  id: string;
  provider: string;
  providerAccountId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  lastLogin: string;
  /** Fonte: backend IdentityStore — nunca derivar no cliente. */
  role?: UserRole;
};

export type LymiarSession = {
  authenticated: boolean;
  user: LymiarUser | null;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
