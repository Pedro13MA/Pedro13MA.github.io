"use client";

export function LoadingAuth({ label = "A verificar sessão…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
