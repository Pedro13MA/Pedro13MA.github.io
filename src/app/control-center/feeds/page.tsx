"use client";

import { Store } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/shared/PlaceholderPage";

export default function AdminFeedsPage() {
  return (
    <PlaceholderPage
      title="Feeds"
      section="Feeds"
      description="Qualidade por merchant e evolução de feeds."
      icon={Store}
    />
  );
}
