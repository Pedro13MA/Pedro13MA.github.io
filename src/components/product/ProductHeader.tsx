import Image from "next/image";
import type { Product, ProductCondition } from "@/lib/types";
import {
  historySpanDays,
  isAbsoluteHistoricalMin,
  MIN_HISTORY_SPAN_DAYS,
} from "@/lib/product-insights";
import { cn, DECISION_UI_LABEL, formatEUR, type DecisionUiKind } from "@/lib/utils";

type Props = { product: Product };

const CONDITION_LABEL: Record<Exclude<ProductCondition, "NEW">, string> = {
  OUTLET: "Outlet",
  REFURBISHED: "Recondicionado",
  OPEN_BOX: "Caixa aberta",
};

function resolveDecisionKind(product: Product): DecisionUiKind {
  const span = historySpanDays(product.history);
  if (product.history.length < 5 || span < Math.min(14, MIN_HISTORY_SPAN_DAYS / 2)) {
    return "unknown";
  }
  return product.decision.semaphore;
}

export function ProductHeader({ product }: Props) {
  const kind = resolveDecisionKind(product);
  const ui = DECISION_UI_LABEL[kind];
  const condition = product.condition ?? "NEW";
  const conditionLabel = condition !== "NEW" ? CONDITION_LABEL[condition] : null;
  const atMin =
    kind === "buy" &&
    (product.decision.isHistoricalMin ||
      isAbsoluteHistoricalMin(product.currentPrice, product.historicalMin));

  return (
    <header className="grid gap-8 md:grid-cols-[240px_1fr]">
      <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 md:h-64">
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

      <div className="flex flex-col justify-center gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {conditionLabel ? (
            <span className="inline-flex rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
              {conditionLabel}
            </span>
          ) : null}
          {product.brand ? (
            <span className="text-sm font-medium text-slate-500">{product.brand}</span>
          ) : null}
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {product.name}
        </h1>

        <p className="font-display text-4xl font-bold tabular-nums tracking-tight text-slate-900">
          {formatEUR(product.currentPrice)}
        </p>

        <div
          className={cn(
            "inline-flex w-fit max-w-full items-center gap-2 rounded-xl border px-3.5 py-2.5 text-base font-semibold",
            ui.className,
          )}
          role="status"
        >
          <span aria-hidden>{ui.emoji}</span>
          <span>Decisão Limiar: {ui.label}</span>
        </div>

        {atMin ? (
          <p className="text-sm font-medium text-orange-800">
            Perto do mínimo histórico observado
          </p>
        ) : null}

        {condition !== "NEW" ? (
          <p className="max-w-2xl rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-sm text-amber-950/80">
            Produto de exposição ou caixa aberta — o preço não mistura com o histórico de
            produtos novos.
          </p>
        ) : null}
      </div>
    </header>
  );
}
