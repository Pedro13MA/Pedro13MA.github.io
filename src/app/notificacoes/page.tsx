import type { Metadata } from "next";
import { NotificationsPageClient } from "@/components/notifications/NotificationsPageClient";

export const metadata: Metadata = {
  title: "Notificações · Limiar",
  description: "Notificações factuais do Limiar.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/notificacoes/" },
};

export default function NotificacoesPage() {
  return <NotificationsPageClient />;
}
