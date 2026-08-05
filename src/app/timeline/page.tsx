import type { Metadata } from "next";
import { TimelinePageClient } from "@/components/watchlists/TimelinePageClient";

export const metadata: Metadata = {
  title: "Timeline · Lymiar",
  description:
    "Acompanhe alterações observadas nos produtos, categorias e projetos que segue.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/timeline/" },
};

export default function TimelinePage() {
  return <TimelinePageClient />;
}
