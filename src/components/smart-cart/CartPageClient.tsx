"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  FileDown,
  Printer,
  Share2,
  ShoppingBag,
} from "lucide-react";
import { detailToProduct, getProductBySlug } from "@/lib/api";
import {
  clearCart,
  createConfig,
  getActiveConfig,
  getCartAlert,
  listConfigs,
  refreshItemFromProduct,
  removeFromCart,
  renameConfig,
  setActiveConfig,
  setItemStatus,
  setPreferredStore,
  setQuantity,
  subscribeSmartCart,
  upsertCartAlert,
} from "@/lib/smart-cart";
import {
  cartProductTotalNaive,
  optimizeAll,
} from "@/lib/smart-cart/optimize";
import type {
  CartConfig,
  CartItem,
  CartItemStatus,
  CartPriceAlert,
  OptimizeOption,
  OptimizeStrategyId,
} from "@/lib/smart-cart/types";
import { DEFAULT_CONFIG_NAMES } from "@/lib/smart-cart/types";
import { storeDisplayName } from "@/lib/storeLogos";
import { cn, formatEUR } from "@/lib/utils";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CloudSyncedBadge } from "@/components/sync/SyncUI";
import { Button, buttonVariants } from "@/components/ui/button";
import { CartAlternatives } from "@/components/smart-cart/CartAlternatives";
import { WatchButton } from "@/components/watchlists/WatchButton";
import { EntityActivityTimeline } from "@/components/watchlists/EntityActivityTimeline";
import {
  baselineFromTotal,
  SMART_CART_WATCH_KEY,
} from "@/lib/watchlists";

const STATUS_LABEL: Record<CartItemStatus, string> = {
  todo: "Falta comprar",
  bought: "Já comprei",
  reserved: "Reservado",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bestUnit(item: CartItem): number {
  if (!item.offers.length) return item.priceAtAdd;
  return Math.min(...item.offers.map((o) => o.price));
}

export function CartPageClient() {
  const [config, setConfig] = useState<CartConfig | null>(null);
  const [configs, setConfigs] = useState<CartConfig[]>([]);
  const [alert, setAlert] = useState<CartPriceAlert | null>(null);
  const [options, setOptions] = useState<OptimizeOption[]>([]);
  const [selectedOpt, setSelectedOpt] =
    useState<OptimizeStrategyId>("min_price");
  const [optimized, setOptimized] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [alertDrop, setAlertDrop] = useState(100);
  const [newCfgName, setNewCfgName] = useState("");

  const reload = useCallback(async () => {
    const [cfg, all, al] = await Promise.all([
      getActiveConfig(),
      listConfigs(),
      getCartAlert(),
    ]);
    setConfig(cfg);
    setConfigs(all);
    setAlert(al);
    if (al) setAlertDrop(al.dropByEur);

    // Refresh prices once (no polling)
    await Promise.all(
      cfg.items.map(async (item) => {
        try {
          const detail = await getProductBySlug(item.slug);
          await refreshItemFromProduct(item.id, detailToProduct(detail));
        } catch {
          /* keep snapshot */
        }
      }),
    );
    const fresh = await getActiveConfig();
    setConfig(fresh);
  }, []);

  useEffect(() => {
    void reload();
    return subscribeSmartCart(() => {
      void getActiveConfig().then(setConfig);
      void listConfigs().then(setConfigs);
    });
  }, [reload]);

  const items = config?.items || [];
  const activeItems = items.filter((i) => i.status !== "bought");

  const currentTotal = useMemo(
    () => cartProductTotalNaive(items),
    [items],
  );

  const runOptimize = () => {
    const opts = optimizeAll(items);
    setOptions(opts);
    setOptimized(true);
    if (opts.length) {
      const best = [...opts].sort((a, b) => a.grandTotal - b.grandTotal)[0];
      setSelectedOpt(best.id);
    }
  };

  const selected = options.find((o) => o.id === selectedOpt) || options[0];
  const worst = options.length
    ? Math.max(...options.map((o) => o.grandTotal))
    : currentTotal;
  const bestTotal = selected?.grandTotal ?? currentTotal;
  const saving = Math.max(0, worst - bestTotal);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/carrinho/`
      : "https://pedro13ma.github.io/carrinho/";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMsg("Ligação copiada");
    } catch {
      setMsg("Falha ao copiar");
    }
  };

  const exportCsv = () => {
    const lines = [
      "produto,quantidade,preço_add,preço_actual,loja,estado",
      ...items.map((i) => {
        const store =
          i.preferredStore ||
          i.offers.sort((a, b) => a.price - b.price)[0]?.storeName ||
          "";
        return [
          `"${i.name.replace(/"/g, '""')}"`,
          i.quantity,
          i.priceAtAdd,
          bestUnit(i),
          `"${store}"`,
          i.status,
        ].join(",");
      }),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `limiar-carrinho-${config?.name || "cart"}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportPdf = () => {
    const rows = items
      .map(
        (i) =>
          `<tr><td>${escapeHtml(i.name)}</td><td>${i.quantity}</td><td>${formatEUR(i.priceAtAdd)}</td><td>${formatEUR(bestUnit(i))}</td><td>${STATUS_LABEL[i.status]}</td></tr>`,
      )
      .join("");
    const optHtml = selected
      ? `<h2>${escapeHtml(selected.label)}</h2><p>Total ${formatEUR(selected.grandTotal)} · ${selected.storeCount} lojas${selected.shippingUnknown ? " · portes desconhecidos" : ""}</p>`
      : "";
    const html = `<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/><title>Carrinho Limiar</title>
<style>body{font-family:system-ui;margin:1.5rem}table{width:100%;border-collapse:collapse;font-size:12px}
td,th{border:1px solid #e2e8f0;padding:6px;text-align:left}th{background:#f8fafc}
@media print{body{margin:0}}</style></head><body>
<h1>Carrinho inteligente — ${escapeHtml(config?.name || "")}</h1>
<p>Total actual ${formatEUR(currentTotal)}</p>
${optHtml}
<table><thead><tr><th>Produto</th><th>Qtd</th><th>Ao adicionar</th><th>Actual</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table>
<script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=800");
    if (!w) {
      setMsg("Permita pop-ups para PDF");
      return;
    }
    w.document.write(html);
    w.document.close();
  };

  return (
    <>
      <SiteHeader />
      <ProtectedRoute>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-10 sm:pt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Compra inteligente{" "}
              <CloudSyncedBadge label="Sincronizado" />
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monte a compra e otimize a combinação de lojas — sem checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <WatchButton
              kind="SMART_CART"
              target={{
                key: SMART_CART_WATCH_KEY,
                label: config?.name || "Carrinho",
                href: "/carrinho/",
              }}
              baseline={baselineFromTotal(
                options.find((o) => o.id === "min_price")?.productTotal ??
                  cartProductTotalNaive(config?.items || []),
              )}
            />
            <select
              aria-label="Configuração guardada"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
              value={config?.id || ""}
              onChange={(e) => {
                void setActiveConfig(e.target.value).then(reload);
              }}
            >
              {configs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={newCfgName}
              onChange={(e) => setNewCfgName(e.target.value)}
              placeholder="Nova config…"
              list="cart-config-suggestions"
              className="h-9 w-36 rounded-lg border border-slate-200 px-2 text-sm"
              aria-label="Nome da nova configuração"
            />
            <datalist id="cart-config-suggestions">
              {DEFAULT_CONFIG_NAMES.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={async () => {
                await createConfig(newCfgName || "Carrinho");
                setNewCfgName("");
                await reload();
              }}
            >
              Guardar config
            </Button>
          </div>
        </div>

        {/* Resumo sticky mobile */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:static">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <SummaryStat label="Total actual" value={formatEUR(currentTotal)} />
            <SummaryStat
              label="Melhor total"
              value={optimized && selected ? formatEUR(bestTotal) : "—"}
            />
            <SummaryStat
              label="Poupança"
              value={optimized && saving > 0 ? formatEUR(saving) : "—"}
              accent={saving > 0}
            />
            <SummaryStat
              label="Lojas"
              value={
                optimized && selected ? String(selected.storeCount) : "—"
              }
            />
            <SummaryStat
              label="Itens"
              value={String(activeItems.reduce((s, i) => s + i.quantity, 0))}
            />
          </div>
          {optimized && selected?.shippingUnknown ? (
            <p className="mt-2 text-xs text-amber-800">
              Portes desconhecidos em pelo menos uma loja — não inventados no
              total.
            </p>
          ) : null}
        </div>

        <div className="mb-4 flex flex-wrap gap-2 print:hidden">
          <Button type="button" onClick={runOptimize} disabled={!activeItems.length}>
            <ShoppingBag className="mr-1.5 h-4 w-4" />
            Otimizar compra
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={copyLink}>
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            Link
          </Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Telegram
          </a>
          <a
            href={`mailto:?subject=Carrinho%20Limiar&body=${encodeURIComponent(shareUrl)}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Email
          </a>
          <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
            CSV
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={exportPdf}>
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Imprimir
          </Button>
          {items.length ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={async () => {
                await clearCart();
                setOptions([]);
                setOptimized(false);
                await reload();
              }}
            >
              Limpar
            </Button>
          ) : null}
        </div>
        {msg ? <p className="mb-3 text-xs text-sky-700">{msg}</p> : null}

        {/* Estratégias */}
        {optimized && options.length ? (
          <section className="mb-6 space-y-3" aria-label="Estratégias de compra">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Estratégias
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelectedOpt(o.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    selected?.id === o.id
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <p className="text-sm font-semibold text-slate-900">{o.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{o.description}</p>
                  <p className="mt-3 font-display text-xl font-bold tabular-nums text-slate-900">
                    {formatEUR(o.grandTotal)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {o.storeCount} loja{o.storeCount === 1 ? "" : "s"}
                    {o.shippingUnknown ? " · portes n/d" : ""}
                  </p>
                </button>
              ))}
            </div>
            {selected ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[32rem] text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                      <th className="px-3 py-2 text-left">Produto</th>
                      <th className="px-3 py-2 text-left">Loja</th>
                      <th className="px-3 py-2 text-left">Preço</th>
                      <th className="px-3 py-2 text-left">Portes</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {selected.assignments.map((a) => (
                      <tr key={a.itemId} className="border-b border-slate-100">
                        <td className="px-3 py-2">
                          {items.find((i) => i.id === a.itemId)?.name || a.slug}
                          {a.quantity > 1 ? ` ×${a.quantity}` : ""}
                        </td>
                        <td className="px-3 py-2">
                          {storeDisplayName(a.store, a.storeName)}
                        </td>
                        <td className="px-3 py-2 font-medium tabular-nums">
                          {formatEUR(a.lineTotal)}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {a.shippingCostEur != null
                            ? formatEUR(a.shippingCostEur)
                            : "n/d"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-700 hover:underline"
                          >
                            Comprar
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="mb-6">
          <EntityActivityTimeline
            kind="SMART_CART"
            targetKey={SMART_CART_WATCH_KEY}
            title="Timeline do carrinho"
          />
        </div>

        {/* Alerta carrinho */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Alerta do carrinho
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Arquitectura local — sync cloud na FASE 8. Sem notificações push
            ainda.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-sm text-slate-600">
              Avisar quando baixar
              <input
                type="number"
                min={10}
                step={10}
                value={alertDrop}
                onChange={(e) => setAlertDrop(Number(e.target.value) || 100)}
                className="ml-2 h-9 w-24 rounded-lg border border-slate-200 px-2"
              />{" "}
              €
            </label>
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                await upsertCartAlert(alertDrop, currentTotal);
                setAlert(await getCartAlert());
                setMsg(
                  `Alerta activo: baixar ${alertDrop} € face a ${formatEUR(currentTotal)}`,
                );
              }}
            >
              Activar
            </Button>
            {alert ? (
              <span className="text-xs text-emerald-700">
                Activo (−{alert.dropByEur} € vs {formatEUR(alert.baselineTotal)})
              </span>
            ) : null}
          </div>
        </section>

        {/* Items */}
        {!items.length ? (
          <div className="rounded-2xl border border-slate-200 px-6 py-14 text-center">
            <p className="font-display text-lg font-semibold text-slate-900">
              Carrinho vazio
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Adicione produtos a partir da pesquisa, categorias ou fichas.
            </p>
            <Link
              href="/catalog/"
              className={cn(
                buttonVariants({ variant: "default" }),
                "mt-6 inline-flex",
              )}
            >
              Ir ao catálogo
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const current = bestUnit(item);
              const delta = item.priceAtAdd - current;
              const assign = selected?.assignments.find(
                (a) => a.itemId === item.id,
              );
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4"
                >
                  <div className="flex gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/p/?id=${encodeURIComponent(item.slug)}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          Adicionado {formatEUR(item.priceAtAdd)}
                        </span>
                        <span>Hoje {formatEUR(current)}</span>
                        {item.insightLabel ? (
                          <span className="font-medium text-slate-700">
                            {item.insightLabel}
                          </span>
                        ) : null}
                        {item.savingsTipEur != null && item.savingsTipEur >= 5 ? (
                          <span className="font-medium text-emerald-700">
                            Pode poupar {formatEUR(item.savingsTipEur)}
                          </span>
                        ) : null}
                        {delta > 1 ? (
                          <span className="font-medium text-emerald-700">
                            ↓ Poupa {formatEUR(delta)}
                          </span>
                        ) : delta < -1 ? (
                          <span className="text-slate-600">
                            ↑ +{formatEUR(-delta)}
                          </span>
                        ) : null}
                        {assign ? (
                          <span>
                            Otimizado:{" "}
                            {storeDisplayName(assign.store, assign.storeName)}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-1 text-xs text-slate-600">
                          Qtd
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(e) => {
                              void setQuantity(
                                item.id,
                                Number(e.target.value) || 1,
                              ).then(() => getActiveConfig().then(setConfig));
                            }}
                            className="h-8 w-14 rounded-lg border border-slate-200 px-1 text-sm"
                            aria-label={`Quantidade ${item.name}`}
                          />
                        </label>
                        <label className="flex items-center gap-1 text-xs text-slate-600">
                          Loja
                          <select
                            value={item.preferredStore || ""}
                            onChange={(e) => {
                              void setPreferredStore(
                                item.id,
                                e.target.value || null,
                              ).then(() => getActiveConfig().then(setConfig));
                            }}
                            className="h-8 max-w-[9rem] rounded-lg border border-slate-200 px-1 text-sm"
                            aria-label={`Loja preferida ${item.name}`}
                          >
                            <option value="">Auto</option>
                            {[...new Map(item.offers.map((o) => [o.store, o]))].map(
                              ([store, o]) => (
                                <option key={store} value={store}>
                                  {o.storeName} · {formatEUR(o.price)}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <label className="flex items-center gap-1 text-xs text-slate-600">
                          Estado
                          <select
                            value={item.status}
                            onChange={(e) => {
                              void setItemStatus(
                                item.id,
                                e.target.value as CartItemStatus,
                              ).then(() => getActiveConfig().then(setConfig));
                            }}
                            className="h-8 rounded-lg border border-slate-200 px-1 text-sm"
                            aria-label={`Estado ${item.name}`}
                          >
                            {(
                              Object.keys(STATUS_LABEL) as CartItemStatus[]
                            ).map((s) => (
                              <option key={s} value={s}>
                                {STATUS_LABEL[s]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <span className="text-sm font-semibold tabular-nums text-slate-900">
                          {formatEUR(current * item.quantity)}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                          onClick={() => {
                            void removeFromCart(item.id).then(() =>
                              getActiveConfig().then(setConfig),
                            );
                          }}
                        >
                          Remover
                        </button>
                      </div>

                      <CartAlternatives
                        item={item}
                        onReplaced={() => {
                          void reload();
                          setOptimized(false);
                          setOptions([]);
                        }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {config ? (
          <p className="mt-6 text-center text-xs text-slate-400">
            Configuração «{config.name}» · tipo {config.kind} (PC build / bundles
            preparados para FASE futura)
            <button
              type="button"
              className="ml-2 underline"
              onClick={async () => {
                const name = window.prompt("Renomear configuração", config.name);
                if (name) {
                  await renameConfig(config.id, name);
                  await reload();
                }
              }}
            >
              Renomear
            </button>
          </p>
        ) : null}
      </main>

      {/* Sticky optimize — mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur sm:hidden print:hidden">
        <Button
          type="button"
          className="h-11 w-full font-semibold"
          onClick={runOptimize}
          disabled={!activeItems.length}
        >
          Otimizar compra
          {optimized && selected
            ? ` · ${formatEUR(selected.grandTotal)}`
            : ""}
        </Button>
      </div>
      </ProtectedRoute>

      <SiteFooter />
    </>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-display text-lg font-bold tabular-nums",
          accent ? "text-emerald-700" : "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}
