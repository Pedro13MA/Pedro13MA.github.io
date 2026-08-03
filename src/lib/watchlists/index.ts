/**
 * FASE 7.19 — Watchlists public API.
 */

export type {
  TimelineEvent,
  TimelineEventKind,
  TimelinePeriod,
  TimelinePeriodGroup,
  WatchBaseline,
  WatchItem,
  WatchKind,
  WatchlistsSnapshot,
  WatchStats,
  WatchTarget,
} from "@/lib/watchlists/types";

export type { TimelineFilter } from "@/lib/watchlists/timeline_service";

export { WATCH_KIND_LABEL, SMART_CART_WATCH_KEY } from "@/lib/watchlists/types";

export {
  emptyWatchlistsSnapshot,
  type WatchStorageAdapter,
} from "@/lib/watchlists/storage-adapter";
export { LocalWatchAdapter, WATCHLISTS_STORAGE_KEY } from "@/lib/watchlists/local-watch-adapter";
export { CloudWatchAdapter } from "@/lib/watchlists/cloud-watch-adapter";

export {
  applyObservation,
  appendEvents,
  baselineFromBrand,
  baselineFromCategoryStats,
  baselineFromProduct,
  baselineFromStore,
  baselineFromTotal,
  findWatch,
  follow,
  getWatchAdapter,
  getWatchStats,
  isWatching,
  listEvents,
  listWatches,
  loadWatchlists,
  removeWatch,
  seedProductHistoryEvents,
  seedProjectHistoryEvents,
  setWatchAdapter,
  setWatchNotes,
  subscribeWatchlists,
  toggleWatch,
  unfollow,
} from "@/lib/watchlists/watch_service";

export {
  diffBaselines,
  eventsFromProductHistory,
  eventsFromProjectPriceHistory,
  filterTimelineEvents,
  formatEventDay,
  groupEventsByPeriod,
  makeEvent,
  mergeUniqueEvents,
  periodOf,
} from "@/lib/watchlists/timeline_service";
