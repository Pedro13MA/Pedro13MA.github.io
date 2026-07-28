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
};

export function SearchBar({ className, autoFocus }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
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

  function go(slug: string) {
    setOpen(false);
    setQuery("");
    // Query route works for any slug under static export (GH Pages).
    router.push(`/p/?id=${encodeURIComponent(slug)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results[0]) go(results[0].slug);
  }

  return (
    <form onSubmit={onSubmit} className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Procurar produto..."
        autoFocus={autoFocus}
        className="h-14 rounded-2xl border-slate-200 bg-white pl-12 text-base shadow-lg"
        aria-label="Procurar produto"
      />
      {open && (loading || results.length > 0 || query.trim().length >= 2) ? (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg">
          {loading ? (
            <li className="px-4 py-3 text-sm text-slate-500">A procurar na API Limiar…</li>
          ) : results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">Sem resultados para “{query.trim()}”.</li>
          ) : (
            results.map((p) => (
              <li key={p.ean}>
                <button
                  type="button"
                  onMouseDown={() => go(p.slug)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-slate-50"
                >
                  <span className="truncate font-medium text-slate-900">{p.name}</span>
                  <span className="shrink-0 font-semibold text-slate-900">
                    {formatEUR(p.currentPrice)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </form>
  );
}
