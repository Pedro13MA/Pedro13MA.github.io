"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCoupons,
  mapSmartCoupon,
  smartCouponToPromotion,
} from "@/lib/api";
import { storeLogoUrl } from "@/lib/coupon-stores";
import {
  formatCouponValidity,
  normalizeCouponStoreSlug,
  resolveStoreLabel,
} from "@/lib/coupon-utils";
import type { Promotion } from "@/lib/types";

function StoreMark({ slug, name }: { slug: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={storeLogoUrl(slug)}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      className="h-10 w-10 rounded-lg bg-white object-contain p-0.5 ring-1 ring-slate-200"
      onError={() => setFailed(true)}
    />
  );
}

function campaignHref(p: Promotion): { href: string; external: boolean } {
  const url = (p.url || "").trim();
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return { href: url, external: true };
  }
  const storeSlug = normalizeCouponStoreSlug(p.storeSlug);
  const code = (p.code || "").trim();
  if (code) {
    return {
      href: `/cupoes/${encodeURIComponent(storeSlug)}/${encodeURIComponent(code)}/`,
      external: false,
    };
  }
  return {
    href: `/cupoes/${encodeURIComponent(storeSlug)}/`,
    external: false,
  };
}

export function HomeCouponsPremium() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hub = await getCoupons();
        if (cancelled) return;
        setItems(
          (hub.coupons || []).slice(0, 8).map((c) => {
            const mapped = mapSmartCoupon(c);
            const slug = normalizeCouponStoreSlug(mapped.storeCode);
            return smartCouponToPromotion(
              { ...mapped, storeCode: slug },
              resolveStoreLabel(slug, mapped.storeName || c.store || c.storeCode),
            );
          }),
        );
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="cupoes" className="scroll-mt-20 border-b border-slate-200 bg-white">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:max-w-7xl">
        <p className="text-sm font-semibold text-[var(--hm-brand)]">Complemento</p>
        <h2 className="mt-3 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Cupões
        </h2>
        <p className="mt-3 max-w-lg text-sm text-slate-500">
          Campanhas à parte do preço observado. O cupão nunca entra no histórico
          como se já estivesse aplicado.
        </p>
        {loading ? (
          <div className="mt-8 h-24 animate-pulse rounded-2xl bg-slate-50" />
        ) : items.length === 0 ? (
          <p className="mt-8 text-sm text-slate-400">Sem campanhas no momento.</p>
        ) : (
          <ul className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {items.map((p) => {
              const storeSlug = normalizeCouponStoreSlug(p.storeSlug);
              const code = (p.code || "").trim() || "CAMPANHA";
              const validity = formatCouponValidity(p);
              const { href, external } = campaignHref(p);
              const className =
                "flex items-center gap-4 px-4 py-4 hover:bg-slate-50 sm:px-5";
              const body = (
                <>
                  <StoreMark slug={storeSlug} name={p.storeName} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-slate-900">
                        {p.storeName}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        {code}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {validity}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-[var(--hm-brand)]">
                    Ver na loja →
                  </span>
                </>
              );
              return (
                <li key={`${storeSlug}-${code}-${p.externalId}`}>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className={className}
                    >
                      {body}
                    </a>
                  ) : (
                    <Link href={href} className={className}>
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
