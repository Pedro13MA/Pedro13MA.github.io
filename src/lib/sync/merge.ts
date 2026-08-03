/** FASE 8.1 — merge local ↔ cloud. */

import { ConflictResolver } from "@/lib/sync/conflict-resolver";
import type { MergeChoice } from "@/lib/sync/types";
import type { UserSpaceSnapshot } from "@/lib/user-space/storage-adapter";
import { DEFAULT_LISTS } from "@/lib/user-space/types";
import type { ProjectsSnapshot } from "@/lib/projects/types";
import type { SmartCartSnapshot } from "@/lib/smart-cart/types";
import type { WatchlistsSnapshot } from "@/lib/watchlists/types";
import type { CompareItem } from "@/lib/compare";
import type { UserPreferences } from "@/lib/sync/types";

export function localHasData(opts: {
  userspace: UserSpaceSnapshot;
  projects: ProjectsSnapshot;
  cart: SmartCartSnapshot;
  watches: WatchlistsSnapshot;
  compare: CompareItem[];
}): boolean {
  return (
    opts.userspace.favorites.length > 0 ||
    opts.userspace.alerts.length > 0 ||
    opts.userspace.lists.some((l) => !l.system) ||
    opts.projects.projects.length > 0 ||
    opts.cart.configs.some((c) => c.items.length > 0) ||
    opts.watches.watches.length > 0 ||
    opts.compare.length > 0
  );
}

export function mergeUserspace(
  local: UserSpaceSnapshot,
  cloud: UserSpaceSnapshot,
  choice: MergeChoice,
): UserSpaceSnapshot {
  if (choice === "ignore_local") return cloud;
  if (choice === "replace_cloud") return local;
  const lists = ConflictResolver.lastModifiedWins(
    [...DEFAULT_LISTS, ...local.lists.filter((l) => !l.system)],
    [...DEFAULT_LISTS, ...cloud.lists.filter((l) => !l.system)],
  );
  // garantir lista sistema
  const hasSystem = lists.some((l) => l.id === "favorites");
  const mergedLists = hasSystem ? lists : [...DEFAULT_LISTS, ...lists];
  return {
    version: Math.max(local.version || 1, cloud.version || 1),
    favorites: ConflictResolver.lastModifiedWins(local.favorites, cloud.favorites, (f) => f.slug),
    alerts: ConflictResolver.lastModifiedWins(local.alerts, cloud.alerts),
    lists: mergedLists,
    notificationTargets: ConflictResolver.lastModifiedWins(
      local.notificationTargets,
      cloud.notificationTargets,
    ),
  };
}

export function mergeProjects(
  local: ProjectsSnapshot,
  cloud: ProjectsSnapshot,
  choice: MergeChoice,
): ProjectsSnapshot {
  if (choice === "ignore_local") return cloud;
  if (choice === "replace_cloud") return local;
  return {
    version: 1,
    projects: ConflictResolver.mergeProjectsByItem(local.projects, cloud.projects),
  };
}

export function mergeCart(
  local: SmartCartSnapshot,
  cloud: SmartCartSnapshot,
  choice: MergeChoice,
): SmartCartSnapshot {
  if (choice === "ignore_local") return cloud;
  if (choice === "replace_cloud") return local;
  const configs = ConflictResolver.lastModifiedWins(local.configs, cloud.configs);
  const alerts = ConflictResolver.lastModifiedWins(local.alerts, cloud.alerts);
  const localMax = Math.max(0, ...local.configs.map((c) => c.updatedAt || 0));
  const cloudMax = Math.max(0, ...cloud.configs.map((c) => c.updatedAt || 0));
  return {
    version: 1,
    activeConfigId:
      localMax >= cloudMax
        ? local.activeConfigId || cloud.activeConfigId
        : cloud.activeConfigId || local.activeConfigId,
    configs,
    alerts,
  };
}

export function mergeWatches(
  local: WatchlistsSnapshot,
  cloud: WatchlistsSnapshot,
  choice: MergeChoice,
): WatchlistsSnapshot {
  if (choice === "ignore_local") return cloud;
  if (choice === "replace_cloud") return local;
  type WithTs<T> = T & { updatedAt: number };
  const watches = ConflictResolver.lastModifiedWins(
    local.watches.map((w) => ({ ...w, updatedAt: w.lastSeen }) as WithTs<(typeof local.watches)[0]>),
    cloud.watches.map((w) => ({ ...w, updatedAt: w.lastSeen }) as WithTs<(typeof cloud.watches)[0]>),
  ).map(({ updatedAt: _u, ...rest }) => rest);
  const events = ConflictResolver.lastModifiedWins(
    local.events.map((e) => ({ ...e, updatedAt: e.at }) as WithTs<(typeof local.events)[0]>),
    cloud.events.map((e) => ({ ...e, updatedAt: e.at }) as WithTs<(typeof cloud.events)[0]>),
  ).map(({ updatedAt: _u, ...rest }) => rest);
  return {
    version: 1,
    watches: watches as WatchlistsSnapshot["watches"],
    events: events as WatchlistsSnapshot["events"],
  };
}

export function mergeCompare(
  local: CompareItem[],
  cloud: CompareItem[],
  choice: MergeChoice,
): CompareItem[] {
  if (choice === "ignore_local") return cloud;
  if (choice === "replace_cloud") return local;
  return ConflictResolver.lastModifiedWins(
    local.map((i) => ({ ...i, updatedAt: i.addedAt, id: i.slug })),
    cloud.map((i) => ({ ...i, updatedAt: i.addedAt, id: i.slug })),
  )
    .map(({ updatedAt: _u, id: _id, ...rest }) => rest as CompareItem)
    .slice(0, 4);
}

export function mergePreferences(
  local: UserPreferences,
  cloud: UserPreferences,
  choice: MergeChoice,
): UserPreferences {
  if (choice === "ignore_local") return cloud;
  if (choice === "replace_cloud") return local;
  const localTs = local.updatedAt ?? 0;
  const cloudTs = cloud.updatedAt ?? 0;
  return localTs >= cloudTs ? { ...cloud, ...local } : { ...local, ...cloud };
}
