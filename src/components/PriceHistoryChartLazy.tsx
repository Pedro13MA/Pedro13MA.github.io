"use client";

import dynamic from "next/dynamic";

function ChartLoading() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-96 w-full animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

export const PriceHistoryChartLazy = dynamic(
  () =>
    import("@/components/PriceHistoryChart").then((m) => m.PriceHistoryChart),
  { ssr: false, loading: () => <ChartLoading /> },
);
