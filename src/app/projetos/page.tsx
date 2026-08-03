import type { Metadata } from "next";
import { ProjectsPageClient } from "@/components/projects/ProjectsPageClient";

export const metadata: Metadata = {
  title: "Projetos · Limiar",
  description:
    "Organize compras em projetos: PC Gaming, escritório, NAS, fotografia e mais — com templates e slots.",
  alternates: { canonical: "/projetos/" },
  openGraph: {
    title: "Projetos Limiar",
    description: "Coleções inteligentes de produtos com objectivo.",
    url: "/projetos/",
    type: "website",
  },
};

export default function ProjetosPage() {
  return <ProjectsPageClient />;
}
