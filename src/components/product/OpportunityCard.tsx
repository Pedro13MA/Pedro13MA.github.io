import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatEUR, formatPct, limiarIndexTone, SEMAPHORE_LABEL } from "@/lib/utils";

type Props = {
  product: Product;
  showDropToday?: boolean;
};

export function OpportunityCard({ product, showDropToday }: Props) {
  const currentPrice = product.currentPrice;
  const dropVsAvg =
    product.avg30d > 0
      ? ((product.avg30d - currentPrice) / product.avg30d) * 100
      : 0;
  const stableVsAvg = Math.abs(dropVsAvg) < 1;
  const sem = SEMAPHORE_LABEL[product.decision.semaphore];
  const tone = limiarIndexTone(product.decision.limiarIndex.value);
  const specParts = [product.chipsetModel, product.vramSpec].filter(Boolean);

  const pvpr = product.originalPrice;
  const showPvpr =
    Boolean(product.isOnSale) && pvpr != null && pvpr > currentPrice;

  // Distinguir queda real vs média / drop do dia / PVPR de campanha
  let discountLabel: string | null = null;
  if (showDropToday && product.dropTodayPct && Math.abs(product.dropTodayPct) >= 1) {
    discountLabel = formatPct(product.dropTodayPct);
  } else if (!stableVsAvg && product.decision.discountPct > 1) {
    discountLabel = formatPct(product.decision.discountPct);
  } else if (!stableVsAvg && Math.abs(dropVsAvg) >= 1) {
    discountLabel = formatPct(dropVsAvg);
  } else if (showPvpr) {
    discountLabel = formatPct(((pvpr! - currentPrice) / pvpr!) * 100);
  }

  return (
    <Link
      href={`/p/?id=${encodeURIComponent(product.slug)}`}
      className="group block h-full"
    >
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
          {/* Máx. 2 badges na imagem — evita tapar o produto no mobile */}
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
          {product.decision.isHistoricalMin && !stableVsAvg ? (
            <p className="text-[11px] font-medium uppercase tracking-wide text-sky-700">
              Mín. histórico
            </p>
          ) : showPvpr ? (
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700">
              Promoção PVPR
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
              <span className="text-sm font-medium text-emerald-700">{discountLabel}</span>
            ) : stableVsAvg ? (
              <span className="text-sm font-medium text-slate-500">= média 30d</span>
            ) : null}
          </div>
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
