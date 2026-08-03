/**
 * FASE 7.19 — refresh factual das watches (só quando a página abre).
 * Sem polling.
 */

import {
  detailToProduct,
  getCategoryStats,
  getLoja,
  getMarca,
  getProductBySlug,
} from "@/lib/api";
import { getProject, projectTotal } from "@/lib/projects";
import { getActiveConfig } from "@/lib/smart-cart";
import {
  cartProductTotalNaive,
  optimizeAll,
} from "@/lib/smart-cart/optimize";
import {
  applyObservation,
  baselineFromBrand,
  baselineFromCategoryStats,
  baselineFromProduct,
  baselineFromStore,
  baselineFromTotal,
  listWatches,
  makeEvent,
  type TimelineEvent,
  type WatchItem,
} from "@/lib/watchlists";

async function observeOne(watch: WatchItem): Promise<TimelineEvent[]> {
  const now = Date.now();
  try {
    switch (watch.kind) {
      case "PRODUCT": {
        const detail = await getProductBySlug(watch.target.key);
        const product = detailToProduct(detail);
        const baseline = baselineFromProduct(product);
        return applyObservation({ watchId: watch.id, baseline });
      }
      case "CATEGORY": {
        const stats = await getCategoryStats(watch.target.key);
        const baseline = baselineFromCategoryStats(stats);
        return applyObservation({ watchId: watch.id, baseline });
      }
      case "BRAND": {
        const brand = await getMarca(watch.target.key);
        const baseline = baselineFromBrand(brand);
        return applyObservation({ watchId: watch.id, baseline });
      }
      case "STORE": {
        const store = await getLoja(watch.target.key);
        const baseline = baselineFromStore(store);
        return applyObservation({ watchId: watch.id, baseline });
      }
      case "PROJECT": {
        const project = await getProject(watch.target.key);
        if (!project) return [];
        const total = projectTotal(project);
        const baseline = baselineFromTotal(total);
        const extra: TimelineEvent[] = [];
        // Slots: comparar preço actual vs priceAtAdd (factual)
        for (const slot of project.slots) {
          const p = slot.product;
          if (!p || !(p.priceAtAdd > 0) || !(p.currentPrice > 0)) continue;
          const d = Math.round((p.currentPrice - p.priceAtAdd) * 100) / 100;
          if (d <= -0.5) {
            extra.push(
              makeEvent({
                watchId: watch.id,
                kind: "PROJECT",
                eventKind: "PROJECT_ITEM_CHEAPER",
                title: `${slot.label} ficou mais barata`,
                summary: `${p.name}: baixou ${Math.abs(d).toFixed(2)} € face ao preço ao adicionar`,
                href: watch.target.href,
                targetLabel: watch.target.label,
                at: now,
                deltaEur: d,
              }),
            );
          } else if (d >= 0.5) {
            extra.push(
              makeEvent({
                watchId: watch.id,
                kind: "PROJECT",
                eventKind: "PROJECT_ITEM_COSTLIER",
                title: `${slot.label} aumentou`,
                summary: `${p.name}: subiu ${d.toFixed(2)} € face ao preço ao adicionar`,
                href: watch.target.href,
                targetLabel: watch.target.label,
                at: now,
                deltaEur: d,
              }),
            );
          }
        }
        return applyObservation({
          watchId: watch.id,
          baseline,
          extraEvents: extra.slice(0, 6),
        });
      }
      case "SMART_CART": {
        const cfg = await getActiveConfig();
        const naive = cartProductTotalNaive(cfg.items);
        const opts = optimizeAll(cfg.items);
        const best = opts.find((o) => o.id === "min_price") || opts[0];
        const minStores = opts.find((o) => o.id === "min_stores");
        const baseline = baselineFromTotal(best?.productTotal ?? naive);
        const extra: TimelineEvent[] = [];
        if (best && naive > 0 && best.productTotal + 0.5 < naive) {
          const save = Math.round((naive - best.productTotal) * 100) / 100;
          extra.push(
            makeEvent({
              watchId: watch.id,
              kind: "SMART_CART",
              eventKind: "CART_SAVINGS",
              title: "Pode poupar",
              summary: `Pode poupar ${save.toFixed(2)} € com a estratégia de menor preço`,
              href: watch.target.href,
              targetLabel: watch.target.label,
              at: now,
              deltaEur: -save,
            }),
          );
        }
        if (
          minStores &&
          best &&
          minStores.storeCount < best.storeCount &&
          minStores.storeCount > 0
        ) {
          extra.push(
            makeEvent({
              watchId: watch.id,
              kind: "SMART_CART",
              eventKind: "CART_FEWER_STORES",
              title: "Outra estratégia usa menos lojas",
              summary: `Estratégia “menos lojas”: ${minStores.storeCount} loja(s) vs ${best.storeCount}`,
              href: watch.target.href,
              targetLabel: watch.target.label,
              at: now,
              deltaCount: minStores.storeCount - best.storeCount,
            }),
          );
        }
        return applyObservation({
          watchId: watch.id,
          baseline,
          extraEvents: extra,
        });
      }
      default:
        return [];
    }
  } catch {
    return [];
  }
}

/** Observa todas as watches activas (uma passagem, sem polling). */
export async function refreshWatchObservations(): Promise<number> {
  const watches = await listWatches(true);
  let count = 0;
  // Sequencial para evitar rajada N+1 agressiva no cliente
  for (const w of watches) {
    const ev = await observeOne(w);
    count += ev.length;
  }
  return count;
}
