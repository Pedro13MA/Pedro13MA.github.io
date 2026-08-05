import type { Metadata } from "next";
import { NotificationPreferencesClient } from "@/components/notifications/NotificationPreferencesClient";

export const metadata: Metadata = {
  title: "Preferências de notificações · Lymiar",
  robots: { index: false, follow: false },
  alternates: { canonical: "/notificacoes/preferencias/" },
};

export default function NotificacoesPreferenciasPage() {
  return <NotificationPreferencesClient />;
}
