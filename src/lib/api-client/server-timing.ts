/** Parser do header Server-Timing (B12 backend). */

import type { ServerTimingMetrics } from "./types";

export function parseServerTiming(header: string | null): ServerTimingMetrics {
  if (!header) return {};
  const out: ServerTimingMetrics = {};
  for (const part of header.split(",")) {
    const trimmed = part.trim();
    const match = /^(\w+);dur=([\d.]+)/.exec(trimmed);
    if (!match) continue;
    const [, name, durStr] = match;
    const dur = Number.parseFloat(durStr);
    if (Number.isNaN(dur)) continue;
    switch (name) {
      case "total":
        out.total = dur;
        break;
      case "handler":
        out.handler = dur;
        break;
      case "sqlite":
        out.sqlite = dur;
        break;
      case "serialize":
        out.serialize = dur;
        break;
      case "canonical":
        out.canonical = dur;
        break;
    }
  }
  return out;
}

export function backendMsFromTiming(timing: ServerTimingMetrics): number | null {
  if (timing.handler != null) return timing.handler;
  if (timing.total != null) return timing.total;
  return null;
}
