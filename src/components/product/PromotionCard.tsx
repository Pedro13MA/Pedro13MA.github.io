import type { Promotion } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Props = { promotion: Promotion };

export function PromotionCard({ promotion }: Props) {
  const discount =
    promotion.discountKind === "percent" && promotion.discountValue != null
      ? `${promotion.discountValue}%`
      : promotion.discountKind === "amount" && promotion.discountValue != null
        ? `${promotion.discountValue}€`
        : null;

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-zinc-200">{promotion.storeName}</p>
          {discount ? <Badge variant="teal">{discount}</Badge> : null}
        </div>
        <p className="line-clamp-2 text-sm text-zinc-400">
          {promotion.title ?? promotion.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {promotion.code ? (
            <code className="rounded bg-white/[0.06] px-2 py-1 font-mono text-xs text-amber-200">
              {promotion.code}
            </code>
          ) : (
            <span className="text-xs text-zinc-600">Sem código</span>
          )}
          <a
            href={promotion.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-teal-300 hover:underline"
          >
            Abrir
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
