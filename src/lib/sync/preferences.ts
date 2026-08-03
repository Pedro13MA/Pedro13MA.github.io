/** FASE 8.1 — preferências sincronizáveis. */

import type { UserPreferences } from "@/lib/sync/types";
import { DEFAULT_PREFERENCES } from "@/lib/sync/types";

const KEY = "limiar.preferences.v1";

export function loadPreferencesLocal(): UserPreferences {
  if (typeof window === "undefined") return { ...DEFAULT_PREFERENCES };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as UserPreferences) };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferencesLocal(prefs: UserPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...prefs, updatedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}
