"use client";

/**
 * FASE 7.19 — card de evento na timeline.
 */

import Link from "next/link";
import {
  formatEventDay,
  WATCH_KIND_LABEL,
  type TimelineEvent,
} from "@/lib/watchlists";
import { cn, formatEUR } from "@/lib/utils";

type Props = {
  event: TimelineEvent;
  className?: string;
};

export function TimelineCard({ event, className }: Props) {
  const kindLabel = WATCH_KIND_LABEL[event.kind] || event.kind;
  return (
    <article
      className={cn(
        "rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {formatEventDay(event.at)} · {kindLabel}
        </p>
        {event.deltaEur != null && Math.abs(event.deltaEur) >= 0.5 ? (
          <p
            className={cn(
              "text-xs font-semibold",
              event.deltaEur < 0 ? "text-emerald-700" : "text-amber-800",
            )}
          >
            {event.deltaEur < 0 ? "↓" : "↑"}{" "}
            {formatEUR(Math.abs(event.deltaEur))}
          </p>
        ) : null}
      </div>
      <h3 className="mt-1 font-display text-base font-semibold text-slate-900">
        <Link href={event.href} className="hover:text-sky-800 hover:underline">
          {event.targetLabel}
        </Link>
      </h3>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{event.title}</p>
      <p className="mt-1 text-sm text-slate-500">{event.summary}</p>
    </article>
  );
}
