/** Breadcrumbs a partir dos campos actuais (category / subcategory) — sem taxonomia nova. */

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

const SUBCATEGORY_TRAIL: Record<string, string[]> = {
  gpu: ["Informática", "Componentes", "Placas Gráficas"],
  cpu: ["Informática", "Componentes", "Processadores"],
  ssd: ["Informática", "Componentes", "Armazenamento"],
  ram: ["Informática", "Componentes", "RAM / Memória"],
  motherboard: ["Informática", "Componentes", "Motherboards"],
  psu: ["Informática", "Componentes", "Fontes de Alimentação"],
  peripheral: ["Informática", "Periféricos"],
  network: ["Informática", "Rede"],
  monitor: ["Informática", "Monitores"],
  laptop: ["Informática", "Portáteis"],
  desktop: ["Informática", "Computadores de Secretária"],
  smartphone: ["Tech", "Smartphones"],
  console: ["Tech", "Consolas"],
  accessory: ["Tech", "Acessórios"],
  air_fryer: ["Casa", "Air Fryers"],
};

const FEED_CATEGORY_PARENT: Record<string, string> = {
  hardware: "Informática",
  informática: "Informática",
  informatica: "Informática",
  electronics: "Tech",
  eletrónica: "Tech",
  electronica: "Tech",
  smartphones: "Tech",
  gaming: "Tech",
  casa: "Casa",
  home: "Casa",
};

function fold(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Constrói crumbs a partir de subcategory (preferido) e category feed.
 * Preparado para futura taxonomia — só usa campos já existentes.
 */
export function buildProductBreadcrumbs(opts: {
  category?: string | null;
  subcategory?: string | null;
  subcategoryLabel?: string | null;
}): BreadcrumbCrumb[] {
  const subKey = fold(opts.subcategory || "");
  const trail = subKey ? SUBCATEGORY_TRAIL[subKey] : undefined;
  if (trail?.length) {
    return trail.map((label) => ({ label }));
  }

  const label =
    (opts.subcategoryLabel || "").trim() ||
    (opts.subcategory && opts.subcategory !== "unmapped"
      ? opts.subcategory.replace(/_/g, " ")
      : "");
  const category = (opts.category || "").trim();
  const crumbs: BreadcrumbCrumb[] = [];

  if (category && fold(category) !== "other" && fold(category) !== "outros") {
    const parent = FEED_CATEGORY_PARENT[fold(category)];
    if (parent && fold(parent) !== fold(category)) {
      crumbs.push({ label: parent });
    }
    crumbs.push({ label: category });
  }

  if (label && fold(label) !== fold(category)) {
    if (crumbs.length === 0) {
      crumbs.push({ label: "Tech" });
    }
    crumbs.push({ label });
  }

  return crumbs;
}
