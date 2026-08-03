/**
 * FASE 8.2 — preferences API.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  fetchNotificationPreferences,
  saveNotificationPreferences,
} from "@/lib/notifications/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("preferences", () => {
  it("get/save preferences", async () => {
    const prefs = {
      channels: { email: true, push: true, browser: false },
      scopes: { product: true },
      quietHours: { enabled: false, start: "22:00", end: "08:00" },
      frequency: "immediate",
      productEvents: { NEW_MIN: true },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ preferences: prefs }),
      }),
    );
    const got = await fetchNotificationPreferences();
    expect(got.frequency).toBe("immediate");
    const saved = await saveNotificationPreferences({ frequency: "daily" });
    expect(saved.channels.email).toBe(true);
  });
});
