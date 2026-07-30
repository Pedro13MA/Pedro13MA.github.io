"use client";

import Link from "next/link";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { TELEGRAM_CHANNEL } from "@/lib/constants";
import type { Product } from "@/lib/types";

type Props = {
  products: Product[];
  loading?: boolean;
};

function SectionSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-80 animate-pulse rounded-2xl border border-slate-200/70 bg-slate-100"
        />
      ))}
    </div>
  );
}

export function LatestDetectedSection({ products, loading }: Props) {
  return (
    <section
      id="ultimas-oportunidades"
      className="scroll-mt-16 border-t border-slate-200/60 bg-[#FAFAFA]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              ⚡ Últimas oportunidades detetadas
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">
              Os produtos mais recentes que o Limiar identificou como verdadeiras
              oportunidades.
            </p>
          </div>
          <Link
            href="/catalog/?section=telegram"
            className="text-sm font-medium text-sky-700 transition-colors duration-150 hover:text-sky-900"
          >
            Ver todas ➔
          </Link>
        </div>

        {loading ? (
          <SectionSkeleton />
        ) : products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <OpportunityCard
                key={`tg-${product.ean}`}
                product={product}
                compact
                detectedAt={product.detectedAt}
              />
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-slate-500">
            Ainda não há oportunidades recentes no canal. Volta em breve.
          </p>
        )}

        <div className="mt-16 rounded-2xl border border-sky-100 bg-sky-50/50 px-6 py-8 sm:px-10 sm:py-10">
          <div className="grid items-center gap-8 md:grid-cols-[1.4fr_auto] md:gap-12">
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                ⚡ Não percas a próxima oportunidade
              </h3>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
                As melhores oportunidades identificadas pelo Limiar são enviadas para o
                Telegram poucos segundos depois de serem publicadas.
              </p>
              <ul className="mt-6 space-y-2.5 text-[15px] text-slate-600">
                <li className="flex items-center gap-2.5">
                  <span aria-hidden>🔔</span>
                  <span>Alertas em tempo real</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span aria-hidden>📉</span>
                  <span>Apenas oportunidades reais</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span aria-hidden>🆓</span>
                  <span>Gratuito</span>
                </li>
              </ul>
            </div>
            <div className="flex md:justify-end">
              <a
                href={TELEGRAM_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-sky-700 px-8 text-sm font-semibold text-white transition-colors duration-150 hover:bg-sky-800 md:w-auto"
              >
                Entrar no Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
