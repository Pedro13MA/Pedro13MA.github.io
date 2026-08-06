/** Store reactivo de métricas para o painel de desenvolvimento. */

import type { ApiMetricEntry } from "./types";

const MAX_ENTRIES = 50;
const entries: ApiMetricEntry[] = [];
const listeners = new Set<() => void>();

let idSeq = 0;

export function nextMetricId(): string {
  idSeq += 1;
  return `m${idSeq}`;
}

export function recordMetric(entry: ApiMetricEntry): void {
  entries.unshift(entry);
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  for (const fn of listeners) fn();
}

export function updateMetricRender(id: string, renderMs: number): void {
  const entry = entries.find((e) => e.id === id);
  if (!entry || entry.renderMs != null) return;
  entry.renderMs = renderMs;
  entry.totalMs = entry.networkMs + entry.transferMs + renderMs;
  for (const fn of listeners) fn();
}

/** Completa métrica de pedido deduplicado (wait time até a Promise partilhada resolver). */
export function updateDedupMetric(
  id: string,
  waitMs: number,
  status: number,
): void {
  const entry = entries.find((e) => e.id === id);
  if (!entry || !entry.deduped) return;
  entry.networkMs = waitMs;
  entry.status = status;
  entry.totalMs = waitMs + entry.transferMs;
  for (const fn of listeners) fn();
}

/** Marca render no pedido mais recente com a etiqueta dada. */
export function markRenderForLabel(label: string, renderMs: number): void {
  const entry = entries.find((e) => e.label === label && e.renderMs == null);
  if (!entry) return;
  updateMetricRender(entry.id, renderMs);
}

export function getRecentMetrics(): readonly ApiMetricEntry[] {
  return entries;
}

export function subscribeMetrics(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isApiMetricsEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.NEXT_PUBLIC_API_METRICS === "1";
}
