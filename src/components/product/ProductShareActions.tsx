"use client";

import { useCallback, useState } from "react";
import { Copy, FileDown, QrCode, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { formatEUR } from "@/lib/utils";
import { displayCategoryLabel } from "@/lib/product-display";

type Props = { product: Product };

export function ProductShareActions({ product }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const url =
    typeof window !== "undefined"
      ? window.location.href
      : `https://lymiar.com/p/?id=${encodeURIComponent(product.slug)}`;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setMsg("Ligação copiada");
    } catch {
      setMsg("Falha ao copiar");
    }
  }, [url]);

  const share = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMsg("Ligação copiada");
    } catch {
      /* cancelado */
    }
  }, [product.name, url]);

  const exportPdf = useCallback(() => {
    const stores = product.offers
      .slice(0, 8)
      .map(
        (o) =>
          `${o.storeName || o.store}: ${formatEUR(o.price)}${
            o.couponCode ? ` (cupão ${o.couponCode})` : ""
          }`,
      )
      .join("\n");
    const html = `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/><title>${escapeHtml(
      product.name,
    )} — Lymiar</title>
<style>
body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;color:#0f172a;line-height:1.5}
h1{font-size:1.5rem} h2{font-size:1.1rem;margin-top:1.5rem}
.meta{color:#64748b;font-size:.9rem} table{width:100%;border-collapse:collapse}
td,th{border-bottom:1px solid #e2e8f0;padding:.5rem;text-align:left}
@media print{body{margin:0}}
</style></head><body>
<h1>${escapeHtml(product.name)}</h1>
<p class="meta">${escapeHtml(product.brand || "")} · ${escapeHtml(
      displayCategoryLabel(
        product.leafId,
        product.subcategoryLabel,
        product.category,
      ) || product.brand || "",
    )} · ${new Date().toLocaleString("pt-PT")}</p>
<p><strong>Preço:</strong> ${formatEUR(product.currentPrice)} · 
<strong>Índice Lymiar:</strong> ${product.decision.lymiarIndex.value}/100 · 
<strong>Mín./Máx.:</strong> ${formatEUR(product.historicalMin)} / ${formatEUR(
      product.historicalMax,
    )}</p>
<h2>Lojas</h2>
<pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(stores || "—")}</pre>
<h2>Histórico</h2>
<p>${product.history.length} pontos observados no Lymiar.</p>
<p class="meta">Resumo gerado no Lymiar — exporte via Imprimir → Guardar como PDF.</p>
<script>window.onload=()=>window.print()</script>
</body></html>`;

    const w = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
    if (!w) {
      setMsg("Permita pop-ups para exportar PDF");
      return;
    }
    w.document.write(html);
    w.document.close();
  }, [product]);

  return (
    <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        <Copy className="mr-1.5 h-4 w-4" />
        Copiar ligação
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={share}>
        <Share2 className="mr-1.5 h-4 w-4" />
        Partilhar
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowQr((v) => !v)}
      >
        <QrCode className="mr-1.5 h-4 w-4" />
        QR Code
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={exportPdf}>
        <FileDown className="mr-1.5 h-4 w-4" />
        Exportar PDF
      </Button>
      {msg ? <span className="text-xs text-slate-500">{msg}</span> : null}
      {showQr ? (
        <div className="w-full pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}`}
            alt="QR Code da página do produto"
            width={140}
            height={140}
            className="rounded-lg border border-slate-200 bg-white p-2"
            loading="lazy"
          />
        </div>
      ) : null}
    </section>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
