import Image from "next/image";
import type { Product, ProductCondition } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatEUR, formatPct, SEMAPHORE_LABEL } from "@/lib/utils";

type Props = { product: Product };

const CONDITION_LABEL: Record<Exclude<ProductCondition, "NEW">, string> = {
  OUTLET: "OUTLET",
  REFURBISHED: "RECONDICIONADO",
  OPEN_BOX: "CAIXA ABERTA",
};

export function ProductHeader({ product }: Props) {
  const sem = SEMAPHORE_LABEL[product.decision.semaphore];
  // Fonte única: currentPrice (= melhor oferta ativa)
  const currentPrice = product.currentPrice;
  const dropVsAvg =
    product.avg30d > 0
      ? ((product.avg30d - currentPrice) / product.avg30d) * 100
      : 0;
  const stableVsAvg = Math.abs(dropVsAvg) < 1;
  const condition = product.condition ?? "NEW";
  const isNonNew = condition !== "NEW";
  const conditionLabel = isNonNew ? CONDITION_LABEL[condition] : null;

  return (
    <header className="grid gap-8 md:grid-cols-[220px_1fr]">
      <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:h-64">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width:768px) 100vw, 220px"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">Sem imagem</div>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{product.brand ?? product.category}</Badge>
          <Badge variant="tier">Tier {product.decision.tier}</Badge>
          <Badge variant="teal">Índice {product.decision.limiarIndex.value}/100</Badge>
          <Badge variant={product.decision.semaphore} className="gap-1.5 text-sm">
            <span aria-hidden>{sem.emoji}</span>
            {sem.label}
          </Badge>
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

        <p className="max-w-2xl text-sm text-slate-500">{product.decision.limiarIndex.summary}</p>

        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Preço atual</p>
            <p className="font-display text-4xl font-bold text-slate-900">
              {formatEUR(currentPrice)}
            </p>
            {product.isOnSale &&
            product.originalPrice != null &&
            product.originalPrice > currentPrice ? (
              <p className="text-sm text-slate-400 line-through">
                PVPR {formatEUR(product.originalPrice)}
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Média 30 dias</p>
            <p className="text-xl font-semibold text-slate-900">{formatEUR(product.avg30d)}</p>
            {stableVsAvg ? (
              <p className="text-sm text-slate-500">Igual à média (0,0%)</p>
            ) : (
              <p className="text-sm text-emerald-700">{formatPct(dropVsAvg)} vs média</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Mín. histórico</p>
            <p className="text-xl font-semibold text-slate-900">
              {formatEUR(product.historicalMin)}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500">EAN {product.ean}</p>
      </div>
    </header>
  );
}
