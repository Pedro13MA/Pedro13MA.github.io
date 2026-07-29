"use client";

import { cn } from "@/lib/utils";

export type HomeConditionFilter = "all" | "new" | "outlet";

const OPTIONS: { id: HomeConditionFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "new", label: "Apenas Novos" },
  { id: "outlet", label: "Outlet / Recondicionado" },
];

type Props = {
  value: HomeConditionFilter;
  onChange: (value: HomeConditionFilter) => void;
  className?: string;
};

export function ConditionFilterPills({ value, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="group"
      aria-label="Filtrar por condição"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
            )}
          >
            {active ? "🔘 " : ""}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function matchesHomeCondition(
  condition: string | undefined,
  filter: HomeConditionFilter,
): boolean {
  if (filter === "all") return true;
  const c = (condition || "NEW").toUpperCase();
  if (filter === "new") return c === "NEW";
  return c === "OUTLET" || c === "REFURBISHED" || c === "OPEN_BOX";
}
