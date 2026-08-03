/**
 * FASE 8.2 — notification center / bell.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

vi.mock("@/components/auth/SessionProvider", () => ({
  useSession: () => ({
    status: "authenticated",
    user: { id: "u1", email: "a@b.c", name: "A" },
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async (url: string) => {
      const u = String(url);
      if (u.includes("/unread")) {
        return { ok: true, json: async () => ({ count: 2 }) };
      }
      if (u.includes("/notifications")) {
        return {
          ok: true,
          json: async () => ({
            items: [
              {
                id: "n1",
                userId: "u1",
                title: "Novo mínimo observado",
                body: "Preço observado.",
                status: "unread",
                archived: false,
                channel: "inapp",
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        };
      }
      return { ok: true, json: async () => ({}) };
    }),
  );
});

describe("notification-center", () => {
  it("mostra sino com contador", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByLabelText("Notificações")).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByText("2")).toBeTruthy();
    });
    fireEvent.click(screen.getByLabelText("Notificações"));
    await waitFor(() => {
      expect(screen.getByText("Novo mínimo observado")).toBeTruthy();
    });
    expect(screen.getByText("Ver todas")).toBeTruthy();
  });
});
