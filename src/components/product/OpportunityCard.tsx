import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { referenceSourceTooltip } from "@/lib/referenceSource";
import { formatEUR, formatPct, limiarIndexTone, SEMAPHORE_LABEL } from "@/lib/utils";

type Props = {
  product: Product;
  showDropToday?: boolean;
  /** Homepage: imagem, nome, preço, índice, selo, CTA — sem ruído. */
  compact?: boolean;
};

function DealScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tone =
    clamped >= 70 ? "bg-emerald-500" : clamped >= 50 ? "bg-amber-500" : "bg-rose-400";
  return (
    <div className="space-y-1" title={`Deal Score ${clamped}/100 — promoção validada pelo Limiar`}>
      <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-slate-500">
        <span>Confiança</span>
        <span className="tabular-nums text-slate-700">{clamped}/100</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

function opportunitySeal(product: Product): string {
  if (product.decision.isHistoricalMin) return "Mínimo Histórico";
  if (product.decision.semaphore === "buy") return "Excelente Oportunidade";
  if (product.decision.semaphore === "fair") return "Bom Preço";
  return "Aguardar";
}

export function OpportunityCard({ product, showDropToday, compact }: Props) {
  const currentPrice = product.currentPrice;
  const sem = SEMAPHORE_LABEL[product.decision.semaphore];
  const tone = limiarIndexTone(product.decision.limiarIndex.value);
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

  const dealScore =
    product.dealScore != null
      ? product.dealScore
      : product.decision.limiarIndex.value;

  if (compact) {
    const seal = opportunitySeal(product);
    return (
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
        <Link href={href} className="group block flex-1">
          <div className="relative flex h-44 w-full items-center justify-center bg-white p-4">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width:768px) 100vw, 33vw"
                unoptimized
              />
            ) : null}
          </div>
          <CardContent className="space-y-2.5 p-4 pt-2">
            <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-900">
              {product.name}
            </p>
            <p className="font-display text-2xl font-bold tabular-nums text-slate-900">
              {formatEUR(currentPrice)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="teal" className={tone.text}>
                Índice {product.decision.limiarIndex.value}/100
              </Badge>
              <Badge variant={product.decision.semaphore}>{seal}</Badge>
            </div>
          </CardContent>
        </Link>
        <div className="px-4 pb-4">
          <Link
            href={href}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900"
          >
            Ver análise
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full overflow-hidden">
        <div className="relative flex h-52 w-full items-center justify-center rounded-t-xl bg-white p-4">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width:768px) 100vw, 33vw"
              unoptimized
            />
          ) : null}
          <div className="absolute left-3 top-3 flex max-w-[70%] flex-wrap gap-1.5">
            <Badge variant={product.decision.semaphore}>{sem.short}</Badge>
            <Badge variant="teal" className={tone.text}>
              {product.decision.limiarIndex.value}/100
            </Badge>
          </div>
        </div>
        <CardContent className="space-y-2 p-4">
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
            <p className="text-xs font-medium text-slate-600">{specParts.join(" · ")}</p>
          ) : null}
          {product.decision.isHistoricalMin ? (
            <p className="text-[11px] font-medium uppercase tracking-wide text-sky-700">
              Mín. histórico
            </p>
          ) : realDiscount != null && realDiscount >= 10 ? (
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700">
              Desconto real
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
          <DealScoreBar score={dealScore} />
          {product.inStock === false ? (
            <p className="text-xs font-medium text-amber-700">Sem stock</p>
          ) : null}
          <p className="line-clamp-2 text-xs text-slate-500">
            {product.decision.limiarIndex.summary}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
