import type { Metadata } from "next";
import { EntrarPageClient } from "@/components/auth/EntrarPageClient";

export const metadata: Metadata = {
  title: "Entrar · Limiar",
  description: "Entra no Limiar com Google, Apple, Microsoft ou GitHub.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/entrar/" },
};

export default function EntrarPage() {
  return <EntrarPageClient />;
}
