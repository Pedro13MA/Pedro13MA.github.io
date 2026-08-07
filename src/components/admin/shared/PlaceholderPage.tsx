"use client";

import { EmptyState, PageHeader } from "@/components/admin/shared";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  description: string;
  section: string;
  icon: LucideIcon;
};

/** Secondary admin pages — layout + empty state only (Phase 1). */
export function PlaceholderPage({ title, description, section, icon: Icon }: Props) {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={title}
        description={description}
        breadcrumb={["Control Center", section]}
      />
      <EmptyState
        title={`${title} · preparado para Fase 2`}
        description="Esta página define a estrutura visual e de navegação. Dados reais, APIs e lógica serão ligados na próxima fase — sem alterações neste layout."
        icon={<Icon className="h-5 w-5" />}
      />
    </div>
  );
}
