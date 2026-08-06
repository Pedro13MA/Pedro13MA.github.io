"use client";

import Link from "next/link";
import { SearchBar } from "@/components/layout/SearchBar";
import { LymiarLogo } from "@/components/ui/LymiarLogo";
import { BRAND_METHOD, BRAND_SUBTITLE, BRAND_TAGLINE } from "@/lib/constants";

const SHORTCUTS = [
  { slug: "computadores", label: "Computadores" },
  { slug: "gaming", label: "Gaming" },
  { slug: "telemoveis", label: "Telemóveis" },
  { slug: "casa", label: "Casa" },
] as const;

export function HomeHero() {
  return (
    <section className="relative overflow-visible border-b border-slate-200/60 bg-gradient-to-b from-white via-sky-50/60 to-white">
      <div className="relative mx-auto max-w-6xl overflow-visible px-4 pb-10 pt-14 sm:px-6 sm:pb-14 sm:pt-20">
        <div className="mb-6">
          <LymiarLogo size={88} variant="primary" alt="Lymiar" priority />
        </div>
        <h1 className="font-display max-w-2xl text-[2.1rem] font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl">
          {BRAND_TAGLINE}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          {BRAND_SUBTITLE}
        </p>
        <div className="mt-8 max-w-xl sm:mt-10 sm:max-w-2xl">
          <SearchBar autoFocus />
        </div>
        <nav
          className="mt-6 flex flex-wrap gap-2"
          aria-label="Atalhos de categoria"
        >
          {SHORTCUTS.map((s) => (
            <Link
              key={s.slug}
              href={`/categoria/${s.slug}/`}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900"
            >
              {s.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-500">
          {BRAND_METHOD}
        </p>
      </div>
    </section>
  );
}
