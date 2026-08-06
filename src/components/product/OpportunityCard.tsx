import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CompareAddButton } from "@/components/product/CompareAddButton";
import { AddToCartButton } from "@/components/smart-cart/AddToCartButton";
import { AddToProjectButton } from "@/components/projects/AddToProjectButton";
import { buildDecisionReason, getOpportunitySeal } from "@/lib/opportunity-seal";
import { referenceSourceTooltip } from "@/lib/referenceSource";
import { formatEUR, formatPct, SEMAPHORE_LABEL, cn } from "@/lib/utils";

type Props = {
  product: Product;
  showDropToday?: boolean;
  /** Homepage: decisão → motivo → lojas. */
  compact?: boolean;
  detectedAt?: string | null;
};

function opportunityCardPropsAreEqual(prev: Props, next: Props): boolean {
  if (prev.compact !== next.compact) return false;
  if (prev.showDropToday !== next.showDropToday) return false;
  if (prev.detectedAt !== next.detectedAt) return false;
  const a = prev.product;
  const b = next.product;
  return (
    a.ean === b.ean &&
    a.slug === b.slug &&
    a.currentPrice === b.currentPrice &&
    a.name === b.name &&
    a.imageUrl === b.imageUrl &&
    a.decision.semaphore === b.decision.semaphore &&
    a.decision.reason === b.decision.reason &&
    a.decision.lymiarIndex?.summary === b.decision.lymiarIndex?.summary
  );
}

export const OpportunityCard = memo(function OpportunityCard({
  product,
  showDropToday,
  compact,
}: Props) {
  const currentPrice = product.currentPrice;
  const sem = SEMAPHORE_LABEL[product.decision.semaphore];
  const specParts = [product.chipsetModel, product.vramSpec].filter(Boolean);
  const href = `/p/?id=${encodeURIComponent(product.slug)}`;

  const pvpr = product.originalPrice;
  const showPvpr =
    Boolean(product.isOnSale) && pvpr != null && pvpr > currentPrice;

  const realDiscount =
    product.realDiscountPct != null
      ? product.realDiscountPct
      : product.decision.discountPct > 0
        ? product.decision.discountPct
        : null;

  let discountLabel: string | null = null;
  let discountTooltip = "";
  if (showDropToday && product.dropTodayPct && Math.abs(product.dropTodayPct) >= 1) {
    discountLabel = formatPct(product.dropTodayPct);
    discountTooltip = "Queda face a ontem";
  } else if (realDiscount != null && realDiscount >= 1) {
    discountLabel = formatPct(realDiscount);
    discountTooltip = referenceSourceTooltip(product.referenceSource);
  }

  if (compact) {
    const seal = getOpportunitySeal(product);
    const reason = buildDecisionReason(product);
    const habitual = product.referencePrice ?? product.avg30d;
    return (
      <article className="catalog-card flex h-full flex-col overflow-hidden">
        <Link href={href} className="group block flex-1">
          <div className="relative flex h-40 w-full items-center justify-center border-b border-[var(--hm-line,#dde3ea)] bg-[var(--hm-bg-soft,#eef2f6)] p-5 sm:h-44">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-3"
                sizes="(max-width:768px) 100vw, 33vw"
                unoptimized
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-3 p-5 pt-4">
            <p
              className={cn(
                "inline-flex w-fit max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold leading-snug",
                seal.kind === "buy"
                  ? "catalog-badge-buy"
                  : seal.kind === "wait"
                    ? "catalog-badge-wait"
                    : seal.className,
              )}
            >
              <span className="truncate">{seal.label}</span>
            </p>
            {seal.showHistoricalMin ? (
              <p className="text-xs font-medium text-[var(--hm-brand-deep,#e2550f)]">
                Perto do mínimo histórico observado
              </p>
            ) : null}
            <p className="line-clamp-2 min-h-[2.75rem] text-[15px] font-medium leading-snug text-[var(--hm-ink,#0b1220)]">
              {product.name}
            </p>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-display text-[1.75rem] font-bold leading-none tracking-tight tabular-nums text-[var(--hm-ink,#0b1220)]">
                {formatEUR(currentPrice)}
              </p>
              {seal.kind === "wait" && habitual != null && habitual > 0 ? (
                <p className="text-sm text-[var(--hm-muted,#5b6b7c)]">
                  Habitual ~{formatEUR(habitual)}
                </p>
              ) : null}
            </div>
            <p className="line-clamp-3 text-sm leading-relaxed text-[var(--hm-muted,#5b6b7c)]">
              {reason}
            </p>
          </div>
        </Link>
        <div className="flex flex-col gap-2 px-5 pb-5">
          <Link
            href={`${href}#lojas`}
            className="catalog-cta w-full"
          >
            Ver lojas
          </Link>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            <Link
              href={`${href}#porque`}
              className="flex h-10 items-center justify-center rounded-xl border border-[var(--hm-line,#dde3ea)] bg-white text-sm font-semibold text-[var(--hm-ink,#0b1220)] transition-colors hover:border-[var(--hm-brand,#ff6a1a)]/40 hover:bg-[var(--hm-brand-soft,#fff1e8)]"
            >
              Porque?
            </Link>
            <Link
              href={`${href}#historico`}
              className="flex h-10 items-center justify-center rounded-xl border border-[var(--hm-line,#dde3ea)] bg-white text-sm font-semibold text-[var(--hm-ink,#0b1220)] transition-colors hover:border-[var(--hm-brand,#ff6a1a)]/40 hover:bg-[var(--hm-brand-soft,#fff1e8)]"
            >
              Histórico
            </Link>
            <CompareAddButton product={product} compact className="h-10 w-full" />
            <AddToCartButton product={product} compact className="h-10 w-full" />
            <AddToProjectButton product={product} compact className="h-10 w-full" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="group relative flex h-full flex-col">
      <Link href={href} className="block flex-1">
        <Card interactive className="h-full overflow-hidden">
          <div className="relative flex h-52 w-full items-center justify-center rounded-t-2xl border-b border-slate-100 bg-slate-50 p-4">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-3"
                sizes="(max-width:768px) 100vw, 33vw"
                unoptimized
              />
            ) : null}
            <div className="absolute left-3 top-3 flex max-w-[70%] flex-wrap gap-1.5">
              <Badge variant={product.decision.semaphore}>{sem.short}</Badge>
            </div>
          </div>
          <CardContent className="space-y-2 p-5 pb-12">
            <p className="line-clamp-2 font-semibold text-slate-900">
              {product.condition && product.condition !== "NEW" ? (
                <span className="mr-1.5 inline-block rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-amber-900">
                  {product.condition === "REFURBISHED"
                    ? "Recond."
                    : product.condition === "OPEN_BOX"
                      ? "Open box"
                      : "Outlet"}
                </span>
              ) : null}
              {product.name}
            </p>
            {specParts.length ? (
              <p className="text-xs font-medium text-slate-500">
                {specParts.join(" · ")}
              </p>
            ) : null}
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-slate-900">
                  {formatEUR(currentPrice)}
                </span>
                {showPvpr ? (
                  <span className="text-xs text-slate-400 line-through">
                    PVPR {formatEUR(pvpr!)}
                  </span>
                ) : null}
              </div>
              {discountLabel ? (
                <span
                  className="relative cursor-help text-sm font-medium text-emerald-700"
                  title={discountTooltip}
                >
                  {discountLabel}
                </span>
              ) : null}
            </div>
            <p className="line-clamp-2 text-xs text-slate-500">
              {buildDecisionReason(product)}
            </p>
          </CardContent>
        </Card>
      </Link>
      <div className="absolute bottom-3 right-3 z-10 flex flex-wrap justify-end gap-1.5">
        <CompareAddButton product={product} compact />
        <AddToCartButton product={product} compact />
        <AddToProjectButton product={product} compact />
      </div>
    </div>
  );
}, opportunityCardPropsAreEqual);
