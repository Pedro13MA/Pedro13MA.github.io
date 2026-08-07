"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/components/auth/SessionProvider";
import { LoadingAuth } from "@/components/auth/LoadingAuth";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { isAdminRole } from "@/lib/auth/roles";

/**
 * Gate do Control Center.
 *
 * - Sem sessão → /entrar/?next=…
 * - Sessão sem role=admin → 404 genérico (não revela o painel)
 *
 * Nota: o site usa `output: "export"` — não há Next.js middleware de edge.
 * A autorização real das APIs está no Hub (`require_admin` → HTTP 404).
 */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { status, user } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname || "/control-center/");
      router.replace(`/entrar/?next=${next}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return <LoadingAuth label="A verificar sessão…" />;
  }

  if (status === "unauthenticated") {
    return <LoadingAuth label="A redirecionar para entrar…" />;
  }

  if (!isAdminRole(user?.role)) {
    return <ControlCenterNotFound />;
  }

  return <>{children}</>;
}

/** 404 indistinguível — não menciona Control Center / admin. */
function ControlCenterNotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Página não encontrada
        </h1>
        <p className="mt-3 text-slate-500">
          Este link não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          Voltar ao início
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
