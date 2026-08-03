import type { Metadata } from "next";
import { EntrarCallbackClient } from "@/components/auth/EntrarCallbackClient";

export const metadata: Metadata = {
  title: "A autenticar · Limiar",
  robots: { index: false, follow: false },
  alternates: { canonical: "/entrar/callback/" },
};

export default function EntrarCallbackPage() {
  return <EntrarCallbackClient />;
}
