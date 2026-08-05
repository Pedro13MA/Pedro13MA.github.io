"use client";

import Link from "next/link";
import { isP33SearchEnabled } from "@/lib/search/flags";

type Props = {
  query: string;
  didYouMean?: string[];
  relatedQueries?: string[];
  categoryRedirect?: { slug: string; url: string } | null;
  inferred?: string | null;
};

export function SearchEmptyState({
  query,
  didYouMean = [],
  relatedQueries = [],
  categoryRedirect,
  inferred,
}: Props) {
  const showHints = isP33SearchEnabled();
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <p className="text-sm leading-relaxed text-slate-600">
        Não encontrámos produtos para «{query}» com os filtros actuais.
      </p>
      {showHints && didYouMean.length > 0 ? (
        <p className="mt-4 text-sm text-slate-700">
          Quis dizer{" "}
          {didYouMean.map((t, i) => (
            <span key={t}>
              {i > 0 ? ", " : null}
              <Link
                href={`/search/?q=${encodeURIComponent(t)}`}
                className="font-medium text-sky-700 underline-offset-2 hover:underline"
              >
                {t}
              </Link>
            </span>
          ))}
          ?
        </p>
      ) : null}
      {showHints && relatedQueries.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Também podes procurar
          </p>
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {relatedQueries.slice(0, 6).map((t) => (
              <li key={t}>
                <Link
                  href={`/search/?q=${encodeURIComponent(t)}`}
                  className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-sky-200"
                >
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {showHints && categoryRedirect ? (
        <p className="mt-4 text-sm">
          <Link
            href={categoryRedirect.url}
            className="font-medium text-sky-700 underline-offset-2 hover:underline"
          >
            Ver categoria {categoryRedirect.slug.replace(/_/g, " ")}
          </Link>
        </p>
      ) : inferred ? (
        <p className="mt-4 text-sm">
          <Link
            href={`/categoria/${encodeURIComponent(inferred)}/`}
            className="font-medium text-sky-700 underline-offset-2 hover:underline"
          >
            Explorar {inferred}
          </Link>
        </p>
      ) : null}
      <p className="mt-4 text-xs text-slate-500">
        Experimenta outro termo, limpa os filtros, ou volta mais tarde.
      </p>
    </div>
  );
}
