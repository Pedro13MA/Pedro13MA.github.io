import type { Metadata } from "next";
import { PerfilPageClient } from "@/components/auth/PerfilPageClient";

export const metadata: Metadata = {
  title: "Perfil · Lymiar",
  description: "O teu perfil Lymiar.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/perfil/" },
};

export default function PerfilPage() {
  return <PerfilPageClient />;
}
