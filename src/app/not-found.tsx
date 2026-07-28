import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-zinc-50">Produto não encontrado</h1>
        <p className="mt-3 text-zinc-400">
          Esse slug/EAN ainda não está nos dados mock do Limiar.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-teal-400"
        >
          Voltar ao início
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
