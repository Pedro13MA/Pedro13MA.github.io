"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type SnackbarAction = {
  label: string;
  onClick: () => void;
};

export type SnackbarMessage = {
  id: string;
  text: string;
  action?: SnackbarAction;
  durationMs?: number;
};

type Ctx = {
  push: (text: string, opts?: { action?: SnackbarAction; durationMs?: number }) => void;
};

const SnackbarContext = createContext<Ctx | null>(null);

export function useSnackbar(): Ctx {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    return {
      push: (text) => {
        if (typeof window !== "undefined") {
          // fallback silencioso se provider ausente
          console.info("[snackbar]", text);
        }
      },
    };
  }
  return ctx;
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SnackbarMessage[]>([]);

  const push = useCallback(
    (text: string, opts?: { action?: SnackbarAction; durationMs?: number }) => {
      const id = `sb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const msg: SnackbarMessage = {
        id,
        text,
        action: opts?.action,
        durationMs: opts?.durationMs ?? 4000,
      };
      setItems((prev) => [...prev.slice(-2), msg]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((m) => m.id !== id));
      }, msg.durationMs);
    },
    [],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {typeof document !== "undefined"
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4"
              aria-live="polite"
            >
              {items.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg",
                  )}
                >
                  <span className="flex-1">{m.text}</span>
                  {m.action ? (
                    <button
                      type="button"
                      className="shrink-0 font-semibold text-sky-300 hover:text-sky-200"
                      onClick={() => {
                        m.action?.onClick();
                        setItems((prev) => prev.filter((x) => x.id !== m.id));
                      }}
                    >
                      {m.action.label}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </SnackbarContext.Provider>
  );
}
