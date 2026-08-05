import type { Metadata } from "next";
import { EntrarPageClient } from "@/components/auth/EntrarPageClient";

export const metadata: Metadata = {
  title: "Entrar · Lymiar",
  description: "Entra no Lymiar com Google, Apple, Microsoft ou GitHub.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/entrar/" },
};

export default function EntrarPage() {
  return <EntrarPageClient />;
}
