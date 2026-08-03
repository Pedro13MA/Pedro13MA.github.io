"use client";

import {
  CATALOG_CONDITIONS,
  type CatalogConditionId,
} from "@/lib/catalog-ui";
import { cn } from "@/lib/utils";

type Props = {
  selected: CatalogConditionId[];
  onChange: (next: CatalogConditionId[]) => void;
};

export function CatalogConditionChecks({ selected, onChange }: Props) {
  const toggle = (id: CatalogConditionId) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <ul className="space-y-1" role="group" aria-label="Estado">
      {CATALOG_CONDITIONS.map((opt) => {
        const on = selected.includes(opt.id);
        return (
          <li key={opt.id}>
            <button
              type="button"
              onClick={() => toggle(opt.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                on
                  ? "bg-sky-50 font-medium text-sky-900"
                  : "text-slate-700 hover:bg-slate-50",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]",
                  on
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-300 bg-white text-transparent",
                )}
              >
                ✓
              </span>
              {opt.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
