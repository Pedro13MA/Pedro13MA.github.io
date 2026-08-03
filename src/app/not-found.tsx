"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Em GitHub Pages (export estático), `/p/slug` não pré-gerado cai aqui.
 * Redireciona para `/p/?id=slug`, que resolve o produto via API.
 */
export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const match = pathname?.match(/^\/p\/([^/]+)\/?$/i);
    if (!match?.[1]) return;
    const id = decodeURIComponent(match[1]);
    if (!id || id === "index") return;
    router.replace(`/p/?id=${encodeURIComponent(id)}`);
  }, [pathname, router]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Página não encontrada
        </h1>
        <p className="mt-3 text-slate-500">
          Este link não existe ou o produto ainda não está no catálogo Limiar.
          Se estavas a abrir um produto, vamos tentar carregar a página correcta…
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
