import type { Metadata } from "next";
import { NotificationsPageClient } from "@/components/notifications/NotificationsPageClient";

export const metadata: Metadata = {
  title: "Notificações · Lymiar",
  description: "Notificações factuais do Lymiar.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/notificacoes/" },
};

export default function NotificacoesPage() {
  return <NotificationsPageClient />;
}
