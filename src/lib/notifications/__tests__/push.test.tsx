/**
 * FASE 8.2 — push registration API shape.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { registerPushDevice } from "@/lib/notifications/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("push", () => {
  it("regista device webpush", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ device: { id: "d1", kind: "webpush" } }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await registerPushDevice({
      endpoint: "https://push.example/x",
      keys: { p256dh: "a", auth: "b" },
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/api/v1/notifications/device",
    );
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body));
    expect(body.kind).toBe("webpush");
    expect(body.endpoint).toContain("push.example");
  });
});
