"use client";

/** Skeleton P34 — hierarquia alinhada com a página (só quando flag ON). */
export function ProductPdpSkeleton() {
  return (
    <main
      className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-label="A carregar produto"
    >
      <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-100" />
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100 sm:h-80 md:h-[28rem]" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-9 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-9 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-40 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-12 w-full max-w-xs animate-pulse rounded-xl bg-slate-100" />
          <div className="grid grid-cols-3 gap-2 sm:max-w-md">
            <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
      <div className="h-28 max-w-2xl animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
    </main>
  );
}
