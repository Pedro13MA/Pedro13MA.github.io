/** FASE 8.1 — resolução de conflitos (lastModified; projetos por item). */

export function lastModifiedWins<T extends { updatedAt?: number; id?: string; slug?: string }>(
  local: T[],
  cloud: T[],
  keyOf: (item: T) => string = (i) => String(i.id || i.slug || ""),
): T[] {
  const map = new Map<string, T>();
  for (const item of cloud) {
    const k = keyOf(item);
    if (k) map.set(k, item);
  }
  for (const item of local) {
    const k = keyOf(item);
    if (!k) continue;
    const existing = map.get(k);
    if (!existing) {
      map.set(k, item);
      continue;
    }
    const localTs = item.updatedAt ?? 0;
    const cloudTs = existing.updatedAt ?? 0;
    map.set(k, localTs >= cloudTs ? item : existing);
  }
  return Array.from(map.values());
}

/** Projetos: merge por project id + slots por slotId (nunca perder). */
export function mergeProjectsByItem<
  T extends {
    id: string;
    updatedAt?: number;
    slots?: Array<{ slotId: string; product?: unknown; selected?: boolean }>;
  },
>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  for (const p of cloud) map.set(p.id, structuredClone(p));
  for (const p of local) {
    const existing = map.get(p.id);
    if (!existing) {
      map.set(p.id, structuredClone(p));
      continue;
    }
    const localTs = p.updatedAt ?? 0;
    const cloudTs = existing.updatedAt ?? 0;
    // Base: o mais recente para metadados
    const base = localTs >= cloudTs ? structuredClone(p) : structuredClone(existing);
    const other = localTs >= cloudTs ? existing : p;
    const slotMap = new Map<string, (typeof base.slots extends (infer U)[] | undefined ? U : never)>();
    for (const s of other.slots || []) {
      slotMap.set(s.slotId, s as never);
    }
    for (const s of base.slots || []) {
      const prev = slotMap.get(s.slotId);
      if (!prev) {
        slotMap.set(s.slotId, s as never);
        continue;
      }
      // Preferir slot com produto; se ambos, last-write no project updatedAt
      const prevHas = !!(prev as { product?: unknown }).product;
      const curHas = !!s.product;
      if (curHas && !prevHas) slotMap.set(s.slotId, s as never);
      else if (curHas === prevHas) {
        slotMap.set(s.slotId, (localTs >= cloudTs ? s : prev) as never);
      }
    }
    base.slots = Array.from(slotMap.values()) as T["slots"];
    base.updatedAt = Math.max(localTs, cloudTs);
    map.set(p.id, base);
  }
  return Array.from(map.values());
}

export const ConflictResolver = {
  lastModifiedWins,
  mergeProjectsByItem,
};
