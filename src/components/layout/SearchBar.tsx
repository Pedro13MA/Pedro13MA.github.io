"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchProducts, type ApiProductSummary } from "@/lib/api";
import { cn, formatEUR } from "@/lib/utils";

type Props = {
  className?: string;
  autoFocus?: boolean;
  /** Valor inicial (ex: página /search) */
  defaultQuery?: string;
};

export function SearchBar({ className, autoFocus, defaultQuery = "" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ApiProductSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = window.setTimeout(() => {
      searchProducts(q, { limit: 8 })
        .then((res) => setResults(res.results))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 320);
    return () => window.clearTimeout(handle);
  }, [query]);

  function goProduct(slug: string) {
    setOpen(false);
    router.push(`/p/?id=${encodeURIComponent(slug)}`);
  }

  function goSearch(raw: string) {
    const q = raw.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search/?q=${encodeURIComponent(q)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    goSearch(query);
  }

  const trimmed = query.trim();
  const showDropdown = open && (loading || results.length > 0 || trimmed.length >= 2);

  return (
    <form onSubmit={onSubmit} className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Procurar produto ou categoria (SSD, RAM, GPU…)"
        autoFocus={autoFocus}
        className="h-14 rounded-2xl border-slate-200 bg-white pl-12 text-base shadow-lg"
        aria-label="Procurar produto"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
      />
      {showDropdown ? (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          role="listbox"
        >
          <ul className="max-h-80 overflow-y-auto overscroll-contain">
            {loading ? (
              <li className="px-4 py-3 text-sm text-slate-500">
                A procurar na API Limiar…
              </li>
            ) : results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-500">
                Sem sugestões. Carrega Enter para ver todos os resultados.
              </li>
            ) : (
              results.map((p) => (
                <li key={p.ean} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={() => goProduct(p.slug)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="truncate font-medium text-slate-900">
                      {p.name}
                    </span>
                    <span className="shrink-0 font-semibold text-slate-900">
                      {formatEUR(p.currentPrice)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
          {trimmed.length >= 2 ? (
            <div className="border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onMouseDown={() => goSearch(query)}
                className="w-full px-4 py-3 text-left text-sm font-medium text-sky-700 hover:bg-sky-50"
              >
                Ver todos os resultados para &apos;{trimmed}&apos; (Pressiona Enter) →
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
