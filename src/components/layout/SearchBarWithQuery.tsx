"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/layout/SearchBar";

function SearchBarWithQueryInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  return <SearchBar defaultQuery={q} />;
}

/** Preserva a query na barra ao entrar/navegar em /search/?q=… */
export function SearchBarWithQuery() {
  return (
    <Suspense fallback={<SearchBar />}>
      <SearchBarWithQueryInner />
    </Suspense>
  );
}
