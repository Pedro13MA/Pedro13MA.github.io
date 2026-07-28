import Image from "next/image";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatEUR, formatPct, SEMAPHORE_LABEL } from "@/lib/utils";

type Props = { product: Product };

export function ProductHeader({ product }: Props) {
  const sem = SEMAPHORE_LABEL[product.decision.semaphore];
  const dropVsAvg =
    ((product.avg30d - product.currentPrice) / product.avg30d) * 100;

  return (
    <header className="grid gap-8 md:grid-cols-[220px_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="220px"
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
          <Badge variant={product.decision.semaphore} className="gap-1.5 text-sm">
            <span aria-hidden>
              {product.decision.semaphore === "buy"
                ? "🟢"
                : product.decision.semaphore === "fair"
                  ? "🟡"
                  : "🔴"}
            </span>
            {sem.label}
          </Badge>
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          {product.name}
        </h1>

        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Preço atual</p>
            <p className="font-display text-4xl font-bold text-slate-900">
              {formatEUR(product.currentPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Média 30 dias</p>
            <p className="text-xl font-semibold text-slate-900">{formatEUR(product.avg30d)}</p>
            <p className="text-sm text-emerald-700">{formatPct(dropVsAvg)} vs média</p>
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
