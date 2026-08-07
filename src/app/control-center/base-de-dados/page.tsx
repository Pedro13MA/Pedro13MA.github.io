"use client";

import { Database } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/shared/PlaceholderPage";

export default function AdminDatabasePage() {
  return (
    <PlaceholderPage
      title="Base de Dados"
      section="Base de Dados"
      description="Schema, crescimento, fragmentação e cobertura."
      icon={Database}
    />
  );
}
