import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const metadata: Metadata = {
  title: "Projeto · Limiar",
  description: "Detalhe do projeto Limiar — slots, totais e evolução de preço.",
  alternates: { canonical: "/projetos/p/" },
};

export default function ProjetoDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        </main>
      }
    >
      <ProtectedRoute>
        <ProjectDetailClient />
      </ProtectedRoute>
    </Suspense>
  );
}
