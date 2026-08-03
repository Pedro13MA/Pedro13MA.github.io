"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type { Promotion } from "@/lib/types";
import { storeLogoUrl } from "@/lib/coupon-stores";
import {
  copyCouponCode,
  formatCouponDiscount,
  formatCouponValidity,
  normalizeCouponStoreSlug,
  resolveCouponDisplayTitle,
  STORE_BADGE_STYLES,
} from "@/lib/coupon-utils";
import { cn } from "@/lib/utils";

type Props = {
  promotion: Promotion;
};

const COPIED_MS = 3000;

function isExternalCampaignUrl(url: string | null | undefined): boolean {
  const u = (url || "").trim();
  return u.startsWith("http://") || u.startsWith("https://");
}

function StoreLogo({ slug, name }: { slug: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const badge = STORE_BADGE_STYLES[slug] ?? STORE_BADGE_STYLES.default;
  if (failed) {
    return (
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase",
          badge.bg,
          badge.text,
        )}
        aria-hidden
      >
        {name.slice(0, 2)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={storeLogoUrl(slug)}
      alt=""
      width={36}
      height={36}
      className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

function resolveTermsText(promotion: Promotion): string | null {
  const title = promotion.title?.trim() || "";
  const campaignRef = promotion.campaignRef?.trim() || "";
  const terms = (promotion.terms || promotion.conditions || "").trim();
  const description = (promotion.description || "").trim();

  const isDup = (text: string) => {
    const n = text.toLowerCase();
    return (
      (title && n === title.toLowerCase()) ||
      (campaignRef && n === campaignRef.toLowerCase())
    );
  };

  if (terms && !isDup(terms)) return terms;
  if (description && !isDup(description)) return description;
  return null;
}

function CouponTermsModal({
  open,
  onClose,
  title,
  campaignRef,
  terms,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  campaignRef?: string | null;
  terms: string;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Fechar condições"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Condições da campanha
            </p>
            <h3
              id={titleId}
              className="mt-1 font-display text-lg font-bold leading-snug text-slate-900"
            >
              {title}
            </h3>
            {campaignRef ? (
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                Ref. {campaignRef}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Fechar
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{terms}</p>
        </div>

        <div className="border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

export function CouponCard({ promotion }: Props) {
  const [copied, setCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(t);
  }, [copied]);

  const storeKey = normalizeCouponStoreSlug(promotion.storeSlug);
  const badge = STORE_BADGE_STYLES[storeKey] ?? STORE_BADGE_STYLES.default;
  const discount = formatCouponDiscount(promotion);
  const { title, campaignRef } = resolveCouponDisplayTitle(promotion);
  const validity = formatCouponValidity(promotion);
  const code = promotion.code?.trim() || "";
  const termsText = resolveTermsText(promotion);
  const officialUrl = isExternalCampaignUrl(promotion.url) ? promotion.url.trim() : null;

  const handleCopy = useCallback(async () => {
    if (!code) return;
    const ok = await copyCouponCode(code);
    if (ok) setCopied(true);
  }, [code]);

  const handleConditions = useCallback(() => {
    if (officialUrl) {
      window.open(officialUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (termsText) setTermsOpen(true);
  }, [officialUrl, termsText]);

  const showConditions = Boolean(officialUrl || termsText);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white",
        "border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        "transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(15,23,42,0.06)]",
        badge.ring,
      )}
    >
      <div className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", badge.bg)} />

      <div className="flex flex-1 flex-col p-5 pl-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <StoreLogo slug={storeKey} name={promotion.storeName} />
            <p className="truncate text-sm font-semibold text-slate-900">
              {promotion.storeName}
            </p>
          </div>
          {discount ? (
            <span className="shrink-0 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200/80">
              {discount}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900">
          {title}
        </h3>

        {campaignRef ? (
          <p className="mt-1.5 text-xs font-medium text-slate-400">Ref. {campaignRef}</p>
        ) : null}

        <p className="mt-2 text-xs font-medium text-slate-500">{validity}</p>

        {code ? (
          <button
            type="button"
            onClick={handleCopy}
            className="mt-5 w-full rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-amber-100/80"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700/80">
              {copied ? "Copiado ✓" : "Código promocional"}
            </p>
            <p className="mt-0.5 font-mono text-lg font-bold tracking-wide text-amber-900">
              {code}
            </p>
          </button>
        ) : (
          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            Sem código — campanha automática na loja
          </p>
        )}

        {showConditions ? (
          <div className="mt-auto border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleConditions}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50"
            >
              Ver condições
            </button>
          </div>
        ) : null}
      </div>

      {termsText && !officialUrl ? (
        <CouponTermsModal
          open={termsOpen}
          onClose={() => setTermsOpen(false)}
          title={title}
          campaignRef={campaignRef}
          terms={termsText}
        />
      ) : null}
    </article>
  );
}
