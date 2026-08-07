"use client";

import { BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/admin/shared/PlaceholderPage";

export default function AdminAnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      section="Analytics"
      description="Tráfego, conversão e funis — preparado para métricas reais."
      icon={BarChart3}
    />
  );
}
