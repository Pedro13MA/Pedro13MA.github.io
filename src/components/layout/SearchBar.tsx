"use client";

import { SearchTypeahead } from "@/components/search/SearchTypeahead";

type Props = {
  className?: string;
  autoFocus?: boolean;
  /** Valor inicial (ex: página /search) */
  defaultQuery?: string;
};

/** Wrapper estável — P33 typeahead quando flag ON; legado no mesmo componente. */
export function SearchBar({ className, autoFocus, defaultQuery = "" }: Props) {
  return (
    <SearchTypeahead
      className={className}
      autoFocus={autoFocus}
      defaultQuery={defaultQuery}
    />
  );
}
