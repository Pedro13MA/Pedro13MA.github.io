/** Tipos de identidade Limiar — espelham o User do Hub (FASE 8.0). */

export type LimiarUser = {
  id: string;
  provider: string;
  providerAccountId: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  lastLogin: string;
};

export type LimiarSession = {
  authenticated: boolean;
  user: LimiarUser | null;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
