"use client";

import { Users } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/shared/PlaceholderPage";

export default function AdminUtilizadoresPage() {
  return (
    <PlaceholderPage
      title="Utilizadores"
      section="Utilizadores"
      description="Contas, sessões e engagement — UI shell apenas."
      icon={Users}
    />
  );
}
