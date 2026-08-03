/**
 * Auth.js (NextAuth v5) config — providers oficiais, JWT, página /entrar.
 *
 * Runtime OAuth/JWT: Hub `/api/v1/auth/*` (export estático GH Pages não
 * hospeda Route Handlers). Este ficheiro é a fonte de verdade dos providers.
 */

import type { NextAuthConfig } from "next-auth";
import Apple from "next-auth/providers/apple";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export const AUTH_PROVIDER_IDS = [
  "google",
  "apple",
  "microsoft",
  "github",
] as const;

export type AuthProviderId = (typeof AUTH_PROVIDER_IDS)[number];

export const AUTH_PROVIDER_LABELS: Record<AuthProviderId, string> = {
  google: "Continuar com Google",
  apple: "Continuar com Apple",
  microsoft: "Continuar com Microsoft",
  github: "Continuar com GitHub",
};

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ?? process.env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID ?? process.env.AUTH_APPLE_CLIENT_ID,
      clientSecret:
        process.env.AUTH_APPLE_SECRET ?? process.env.AUTH_APPLE_CLIENT_SECRET,
    }),
    MicrosoftEntraID({
      clientId:
        process.env.AUTH_MICROSOFT_ID ?? process.env.AUTH_MICROSOFT_CLIENT_ID,
      clientSecret:
        process.env.AUTH_MICROSOFT_SECRET ??
        process.env.AUTH_MICROSOFT_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_TENANT_ID ?? "common"}/v2.0`,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? process.env.AUTH_GITHUB_CLIENT_ID,
      clientSecret:
        process.env.AUTH_GITHUB_SECRET ?? process.env.AUTH_GITHUB_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/entrar",
  },
  trustHost: true,
} satisfies NextAuthConfig;
