"use client";

import { useState } from "react";
import { MONITORED_STORES } from "@/lib/coupon-stores";

function StoreLogo({ name, logoUrl }: { name: string; logoUrl: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export function StoreLogosSection() {
  return (
    <section id="lojas" className="border-t border-slate-200/80 bg-white scroll-mt-16">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center font-display text-2xl font-bold text-slate-900">
          Lojas monitorizadas
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {MONITORED_STORES.map((store) => (
            <div
              key={store.slug}
              className="flex h-20 w-28 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-slate-50/60 px-3 transition hover:border-slate-300 hover:bg-white"
              title={store.name}
            >
              <StoreLogo name={store.name} logoUrl={store.logoUrl} />
              <span className="truncate text-[10px] font-medium text-slate-500">
                {store.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
