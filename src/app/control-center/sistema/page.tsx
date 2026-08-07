"use client";

import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/shared/PlaceholderPage";

export default function AdminSistemaPage() {
  return (
    <PlaceholderPage
      title="Sistema"
      section="Sistema"
      description="Preferências do Control Center, feature flags e versão."
      icon={Settings}
    />
  );
}
