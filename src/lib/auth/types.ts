/** Tipos de identidade Lymiar — espelham o User do Hub (FASE 8.0). */

export type LymiarUser = {
  id: string;
  provider: string;
  providerAccountId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  lastLogin: string;
};

export type LymiarSession = {
  authenticated: boolean;
  user: LymiarUser | null;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
