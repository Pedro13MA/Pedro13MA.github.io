/**
 * FASE 7.9 — contrato de persistência (local agora, cloud depois).
 */

import type {
  AlertRule,
  Favorite,
  NotificationTarget,
  SavedList,
} from "@/lib/user-space/types";

export type UserSpaceSnapshot = {
  favorites: Favorite[];
  lists: SavedList[];
  alerts: AlertRule[];
  notificationTargets: NotificationTarget[];
  version: number;
};

export interface StorageAdapter {
  readonly name: string;
  load(): Promise<UserSpaceSnapshot>;
  save(snapshot: UserSpaceSnapshot): Promise<void>;
  /** Reserva para sync futuro — LocalStorage no-op. */
  sync?(): Promise<void>;
}
