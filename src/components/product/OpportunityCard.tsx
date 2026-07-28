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
  const drop = ((product.avg30d - product.currentPrice) / product.avg30d) * 100;
  const sem = SEMAPHORE_LABEL[product.decision.semaphore];
  const tone = limiarIndexTone(product.decision.limiarIndex.value);

  return (
    <Link
      href={`/p/?id=${encodeURIComponent(product.slug)}`}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden">
        <div className="relative aspect-[4/3] bg-slate-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 33vw"
              unoptimized
            />
          ) : null}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <Badge variant={product.decision.semaphore}>{sem.short}</Badge>
            <Badge variant="teal" className={tone.text}>
              {product.decision.limiarIndex.value}/100
            </Badge>
            {product.decision.isHistoricalMin ? (
              <Badge variant="default">Mín. histórico</Badge>
            ) : null}
          </div>
        </div>
        <CardContent className="space-y-2 p-4">
          <p className="line-clamp-2 font-semibold text-slate-900">{product.name}</p>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold text-slate-900">
              {formatEUR(product.currentPrice)}
            </span>
            <span className="text-sm font-medium text-emerald-700">
              {showDropToday && product.dropTodayPct
                ? formatPct(product.dropTodayPct)
                : formatPct(drop)}
            </span>
          </div>
          <p className="line-clamp-2 text-xs text-slate-500">
            {product.decision.limiarIndex.summary}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
