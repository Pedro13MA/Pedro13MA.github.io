import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Produto não encontrado
        </h1>
        <p className="mt-3 text-slate-500">
          Esse slug/EAN ainda não está nos dados mock do Limiar.
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
