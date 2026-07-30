"use client";

import Link from "next/link";
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
  opportunityCount?: number | null;
};

const COPIED_MS = 3000;

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

  // Preferir termos Awin explícitos
  if (terms && !isDup(terms)) {
    return terms;
  }
  // Se não houver terms, usar descrição completa quando for mais do que o título
  if (description && !isDup(description)) {
    return description;
  }
  return null;
}

function CouponTermsModal({
  open,
  onClose,
  title,
  campaignRef,
  description,
  terms,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  campaignRef?: string | null;
  description?: string | null;
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

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          {description && description !== terms ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Descrição
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {description}
              </p>
            </div>
          ) : null}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Termos e condições
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {terms}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

export function CouponCard({ promotion, opportunityCount }: Props) {
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
  const shortPreview =
    promotion.description?.trim() &&
    promotion.description.trim().toLowerCase() !== title.toLowerCase()
      ? promotion.description.trim()
      : null;
  const detailHref =
    code && storeKey
      ? `/cupoes/${encodeURIComponent(storeKey)}/${encodeURIComponent(code.toUpperCase())}/`
      : storeKey
        ? `/cupoes/${encodeURIComponent(storeKey)}/`
        : null;

  const handleCopy = useCallback(async () => {
    if (!code) return;
    const ok = await copyCouponCode(code);
    if (ok) setCopied(true);
  }, [code]);

  const ctaLabel =
    opportunityCount != null && opportunityCount > 0
      ? `Ver ${opportunityCount} produtos elegíveis`
      : "Ver produtos elegíveis";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
        "border-slate-200/90 hover:border-sky-300 hover:shadow-md",
        badge.ring,
      )}
    >
      <div className={cn("absolute inset-y-3 left-0 w-1 rounded-r-full", badge.bg)} />

      <div className="flex flex-1 flex-col p-4 pl-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <StoreLogo slug={storeKey} name={promotion.storeName} />
            <p className="truncate text-sm font-semibold text-slate-900">
              {promotion.storeName}
            </p>
          </div>
          {discount ? (
            <span className="shrink-0 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-200/80">
              {discount}
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">
          {title}
        </h3>

        {campaignRef ? (
          <p className="mt-1 text-[11px] font-medium text-slate-400">
            Ref. {campaignRef}
          </p>
        ) : null}

        <p className="mt-1.5 text-xs font-medium text-slate-500">{validity}</p>

        {shortPreview ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {shortPreview}
          </p>
        ) : null}

        {code ? (
          <button
            type="button"
            onClick={handleCopy}
            className="mt-4 w-full rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-left transition hover:bg-amber-100/80"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700/80">
              {copied ? "Copiado ✓" : "Copiar código"}
            </p>
            <p className="mt-0.5 font-mono text-lg font-bold tracking-wide text-amber-900">
              {code}
            </p>
          </button>
        ) : (
          <p className="mt-4 text-xs text-slate-400">
            Sem código — campanha automática na loja
          </p>
        )}

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {detailHref ? (
            <Link
              href={detailHref}
              className={cn(
                "block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                "bg-sky-600 text-white hover:bg-sky-700",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600",
              )}
            >
              {ctaLabel}
            </Link>
          ) : null}

          {termsText ? (
            <button
              type="button"
              onClick={() => setTermsOpen(true)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Ver condições
            </button>
          ) : null}
        </div>
      </div>

      {termsText ? (
        <CouponTermsModal
          open={termsOpen}
          onClose={() => setTermsOpen(false)}
          title={title}
          campaignRef={campaignRef}
          description={promotion.description}
          terms={termsText}
        />
      ) : null}
    </article>
  );
}
