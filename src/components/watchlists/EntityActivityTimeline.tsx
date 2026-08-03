"use client";

/**
 * FASE 7.19 — timeline filtrada de eventos guardados para uma entidade.
 */

import { useEffect, useState } from "react";
import {
  filterTimelineEvents,
  formatEventDay,
  listEvents,
  subscribeWatchlists,
  type TimelineEvent,
  type WatchKind,
} from "@/lib/watchlists";

type Props = {
  kind: WatchKind;
  targetKey: string;
  title?: string;
  emptyHint?: string;
  limit?: number;
};

export function EntityActivityTimeline({
  kind,
  targetKey,
  title = "Atividade observada",
  emptyHint = "Segue esta página para registar alterações factuais ao longo do tempo.",
  limit = 12,
}: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const load = () => {
      void listEvents().then((all) => {
        const filtered = all
          .filter(
            (e) =>
              e.kind === kind &&
              (e.href.includes(encodeURIComponent(targetKey)) ||
                e.href.includes(targetKey) ||
                e.searchText.includes(targetKey.toLowerCase())),
          )
          .slice(0, limit);
        setEvents(filtered);
      });
    };
    load();
    return subscribeWatchlists(load);
  }, [kind, limit, targetKey]);

  if (!events.length) {
    return (
      <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5">
        <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{emptyHint}</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      <ol className="relative space-y-0 border-l border-slate-200 pl-4">
        {events.map((e) => (
          <li key={e.id} className="relative pb-4 last:pb-0">
            <span
              className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-white"
              aria-hidden
            />
            <p className="text-xs text-slate-400">{formatEventDay(e.at)}</p>
            <p className="text-sm font-semibold text-slate-900">{e.title}</p>
            <p className="text-sm text-slate-500">{e.summary}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Re-export helper for pages that filter locally. */
export { filterTimelineEvents };
