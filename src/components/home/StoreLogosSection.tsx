"use client";

import { useState } from "react";
import { MONITORED_STORES } from "@/lib/coupon-stores";

function StoreLogo({ name, logoUrl }: { name: string; logoUrl: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-bold text-slate-500">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt=""
      width={44}
      height={44}
      className="h-11 w-11 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export function StoreLogosSection() {
  return (
    <section id="lojas" className="scroll-mt-16 border-t border-slate-200/60 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Lojas monitorizadas
        </h2>
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-8 sm:gap-x-10">
          {MONITORED_STORES.map((store) => (
            <div
              key={store.slug}
              className="flex w-[4.5rem] flex-col items-center gap-2.5"
              title={store.name}
            >
              <StoreLogo name={store.name} logoUrl={store.logoUrl} />
              <span className="truncate text-center text-xs font-medium text-slate-500">
                {store.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
