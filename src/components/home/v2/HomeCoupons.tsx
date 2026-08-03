"use client";

import Link from "next/link";
import type { ApiSmartCoupon } from "@/lib/api";
import {
  HomeEmpty,
  HomeScroller,
  HomeSection,
} from "@/components/home/v2/HomeShared";

export function HomeCoupons({ items }: { items: ApiSmartCoupon[] }) {
  return (
    <HomeSection
      id="cupoes"
      title="Últimos cupões"
      subtitle="Códigos informativos — aplicar na loja. Não alteram o preço Limiar."
      href="/#cupoes"
    >
      {items.length ? (
        <HomeScroller>
          {items.slice(0, 12).map((c, i) => {
            const store = c.storeSlug || c.storeCode || "loja";
            const code = (c.code || "").trim() || "sem-codigo";
            return (
              <Link
                key={`${store}-${code}-${i}`}
                href={`/cupoes/${encodeURIComponent(store)}/${encodeURIComponent(code)}/`}
                className="w-48 shrink-0 snap-start rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {c.store || store}
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                  {code}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {c.title || c.description || "Cupão activo"}
                </p>
              </Link>
            );
          })}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Sem cupões activos para listar." />
      )}
    </HomeSection>
  );
}
