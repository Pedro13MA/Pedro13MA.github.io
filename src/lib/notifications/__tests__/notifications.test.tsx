/**
 * FASE 8.2 — notifications helpers.
 */

import { describe, it, expect } from "vitest";
import { groupNotificationsByPeriod, type AppNotification } from "@/lib/notifications/api";

function n(partial: Partial<AppNotification> & { id: string; createdAt: string }): AppNotification {
  return {
    userId: "u",
    title: "t",
    body: "b",
    channel: "inapp",
    status: "unread",
    archived: false,
    ...partial,
  };
}

describe("notifications grouping", () => {
  it("agrupa por período", () => {
    const now = new Date();
    const today = n({
      id: "1",
      createdAt: now.toISOString(),
      title: "Hoje",
    });
    const older = n({
      id: "2",
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
      title: "Antigo",
    });
    const groups = groupNotificationsByPeriod([today, older]);
    expect(groups.some((g) => g.period === "today")).toBe(true);
    expect(groups.some((g) => g.period === "older")).toBe(true);
  });
});
