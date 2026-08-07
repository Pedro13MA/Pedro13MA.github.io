"use client";

import { ScrollText } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/shared/PlaceholderPage";

export default function AdminLogsPage() {
  return (
    <PlaceholderPage
      title="Logs"
      section="Logs"
      description="Erros, warnings e tendências — shell visual."
      icon={ScrollText}
    />
  );
}
