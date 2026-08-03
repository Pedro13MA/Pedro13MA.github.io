import type { Metadata } from "next";
import { PerfilPageClient } from "@/components/auth/PerfilPageClient";

export const metadata: Metadata = {
  title: "Perfil · Limiar",
  description: "O teu perfil Limiar.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/perfil/" },
};

export default function PerfilPage() {
  return <PerfilPageClient />;
}
