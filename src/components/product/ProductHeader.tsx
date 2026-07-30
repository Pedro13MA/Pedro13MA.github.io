import Image from "next/image";
import type { Product, ProductCondition } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  buildProductSummary,
  isAbsoluteHistoricalMin,
} from "@/lib/product-insights";
import { referenceSourceLabelPt, referenceSourceTooltip } from "@/lib/referenceSource";
import { cn, formatEUR, formatPct, SEMAPHORE_LABEL } from "@/lib/utils";

type Props = { product: Product };

const CONDITION_LABEL: Record<Exclude<ProductCondition, "NEW">, string> = {
  OUTLET: "OUTLET",
  REFURBISHED: "RECONDICIONADO",
  OPEN_BOX: "CAIXA ABERTA",
};

const LIMIAR_INDEX_HINT =
  "Avalia a qualidade global da oportunidade considerando histórico, volatilidade e mercado.";
const DEAL_SCORE_HINT =
  "Mede apenas o quão competitivo é o preço actual.";

function InfoHint({ text }: { text: string }) {
  return (
    <span className="group/hint relative inline-flex">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[11px] font-semibold leading-none text-teal-800/70 transition hover:bg-teal-100 hover:text-teal-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        aria-label={text}
        title={text}
      >
        ⓘ
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left text-[11px] font-normal normal-case leading-snug tracking-normal text-slate-600 opacity-0 shadow-lg transition group-hover/hint:opacity-100 group-focus-within/hint:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export function ProductHeader({ product }: Props) {
  const sem = SEMAPHORE_LABEL[product.decision.semaphore];
  const lowestPrice = product.currentPrice;
  const marketAvg = product.referencePrice ?? product.avg30d;
  const pvpr =
    product.originalPrice != null && product.originalPrice > lowestPrice
      ? product.originalPrice
      : null;
  const realDiscount =
    product.realDiscountPct != null
      ? product.realDiscountPct
      : product.decision.discountPct;
  const condition = product.condition ?? "NEW";
  const isNonNew = condition !== "NEW";
  const conditionLabel = isNonNew ? CONDITION_LABEL[condition] : null;
  const dealScore = product.dealScore;
  const refLabel = referenceSourceLabelPt(product.referenceSource);
  const atAbsoluteMin =
    product.decision.isHistoricalMin ||
    isAbsoluteHistoricalMin(lowestPrice, product.historicalMin);
  const summary = buildProductSummary(product);

  return (
    <header className="grid gap-8 md:grid-cols-[240px_1fr]">
      <div className="space-y-3">
        <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:h-64">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width:768px) 100vw, 240px"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              Sem imagem
            </div>
          )}
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{summary}</p>
      </div>

      <div className="flex flex-col justify-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{product.brand ?? product.category}</Badge>
          <Badge variant="teal" className="gap-1.5">
            Índice Limiar {product.decision.limiarIndex.value}/100
            <InfoHint text={LIMIAR_INDEX_HINT} />
          </Badge>
          {dealScore != null ? (
            <Badge variant="teal" className="gap-1.5">
              Deal Score {Math.round(dealScore)}/100
              <InfoHint text={DEAL_SCORE_HINT} />
            </Badge>
          ) : null}
          <Badge variant={product.decision.semaphore} className="gap-1.5 text-sm">
            <span aria-hidden>{sem.emoji}</span>
            {sem.label}
          </Badge>
          {atAbsoluteMin ? (
            <span
              className={cn(
                "limiar-flame-badge inline-flex items-center gap-1 rounded-md border border-orange-300/80",
                "bg-gradient-to-r from-orange-50 to-amber-50 px-2.5 py-1 text-xs font-bold",
                "uppercase tracking-wide text-orange-900",
              )}
            >
              <span aria-hidden>🔥</span>
              Mínimo Histórico Absoluto
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {product.name}
          </h1>
          {conditionLabel ? (
            <span className="inline-flex shrink-0 items-center rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
              [{conditionLabel}]
            </span>
          ) : null}
        </div>

        {isNonNew ? (
          <p className="max-w-2xl rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-sm text-amber-950/80">
            Este produto é de exposição/caixa aberta. O seu preço não contamina o mínimo
            histórico de produtos novos.
          </p>
        ) : null}

        <div
          className={cn(
            "rounded-2xl border p-4 sm:p-5",
            atAbsoluteMin
              ? "border-orange-200/90 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/50"
              : "border-slate-200/90 bg-white",
          )}
        >
          <div className="flex flex-wrap items-end gap-6 sm:gap-10">
            {pvpr != null ? (
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">PVPR</p>
                <p className="mt-0.5 text-lg font-medium text-slate-400 line-through decoration-slate-400/80">
                  {formatEUR(pvpr)}
                </p>
              </div>
            ) : null}

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Preço médio de mercado
              </p>
              <p className="mt-0.5 font-display text-xl font-semibold text-slate-800">
                {formatEUR(marketAvg)}
              </p>
              <p
                className="cursor-help text-xs text-slate-500"
                title={referenceSourceTooltip(product.referenceSource)}
              >
                {refLabel}
              </p>
            </div>

            <div className="min-w-[9rem]">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Preço mais baixo actual
              </p>
              <p
                className={cn(
                  "mt-0.5 font-display text-4xl font-bold tabular-nums",
                  atAbsoluteMin ? "text-orange-700" : "text-slate-900",
                )}
              >
                {formatEUR(lowestPrice)}
              </p>
              {realDiscount >= 1 ? (
                <p className="text-sm font-medium text-emerald-700">
                  {formatPct(realDiscount)} abaixo da referência
                </p>
              ) : (
                <p className="text-sm text-slate-500">Sem desconto real significativo</p>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Mín. histórico registado: {formatEUR(product.historicalMin)}
            {product.historicalMax > product.historicalMin
              ? ` · Máx.: ${formatEUR(product.historicalMax)}`
              : ""}
            {" · "}
            EAN {product.ean}
          </p>
        </div>
      </div>
    </header>
  );
}
