"use client";

import { Server } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/shared/PlaceholderPage";

export default function AdminInfraPage() {
  return (
    <PlaceholderPage
      title="Infraestrutura"
      section="Infraestrutura"
      description="VPS, API, frontend, workers e certificados."
      icon={Server}
    />
  );
}
