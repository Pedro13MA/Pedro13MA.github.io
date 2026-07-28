import type { Offer } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatEUR } from "@/lib/utils";

type Props = { offers: Offer[] };

export function StoreCompareTable({ offers }: Props) {
  const sorted = [...offers].sort((a, b) => a.price - b.price);
  const best = sorted[0]?.store;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Loja</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Cupão</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((offer) => (
          <TableRow key={offer.store}>
            <TableCell className="font-medium">
              {offer.storeName}
              {offer.store === best ? (
                <Badge variant="teal" className="ml-2">
                  Melhor
                </Badge>
              ) : null}
            </TableCell>
            <TableCell>
              <span className="text-teal-300">{formatEUR(offer.price)}</span>
              {offer.originalPrice ? (
                <span className="ml-2 text-xs text-zinc-500 line-through">
                  {formatEUR(offer.originalPrice)}
                </span>
              ) : null}
            </TableCell>
            <TableCell>
              {offer.couponCode ? (
                <code className="rounded bg-white/[0.06] px-2 py-1 font-mono text-xs text-amber-200">
                  {offer.couponCode}
                </code>
              ) : (
                <span className="text-zinc-600">—</span>
              )}
            </TableCell>
            <TableCell>
              {offer.inStock === false ? (
                <span className="text-rose-300">Esgotado</span>
              ) : (
                <span className="text-emerald-400">Disponível</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <a
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-h-9")}
              >
                Ver oferta
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
