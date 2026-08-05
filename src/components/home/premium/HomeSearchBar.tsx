"use client";

import { SearchTypeahead } from "@/components/search/SearchTypeahead";

/** Pesquisa homepage — light, CTA principal. */
export function HomeSearchBar({ autoFocus }: { autoFocus?: boolean }) {
  return (
    <SearchTypeahead
      autoFocus={autoFocus}
      placeholder="O que queres comprar? SSD, Apple Watch, Air Fryer…"
    />
  );
}
