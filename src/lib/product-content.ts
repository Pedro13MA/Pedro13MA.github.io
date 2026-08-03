/**
 * FASE 7.8 — helpers de conteúdo / specs / FAQ a partir de dados existentes.
 * Nunca inventa especificações técnicas.
 */

import type { Product } from "@/lib/types";

export type SpecRow = { key: string; label: string; value: string };

/** Ordem preferida de atributos por leaf / subcategory. */
const ATTR_ORDER: Record<string, string[]> = {
  gpu: [
    "vram_gb",
    "chipset",
    "manufacturer",
    "boost_mhz",
    "base_mhz",
    "memory_bus",
    "pcie",
    "tdp_w",
    "power_w",
    "hdmi",
    "displayport",
    "length_mm",
    "rgb",
    "series",
    "model",
  ],
  laptop: [
    "cpu",
    "processor",
    "ram_gb",
    "memory_gb",
    "capacity_gb",
    "ssd",
    "gpu",
    "screen_size",
    "panel",
    "refresh_rate",
    "weight_kg",
    "resolution",
  ],
  smartphone: [
    "screen_size",
    "processor",
    "ram_gb",
    "capacity_gb",
    "camera",
    "battery_mah",
    "os",
    "refresh_rate",
  ],
  ssd: ["capacity_gb", "interface", "pcie", "read_mb_s", "write_mb_s", "form_factor"],
  cpu: ["cores", "threads", "socket", "boost_mhz", "tdp_w", "series"],
  monitor: ["screen_size", "resolution", "refresh_rate", "panel", "hdmi", "displayport"],
};

const ATTR_LABELS: Record<string, string> = {
  vram_gb: "VRAM",
  chipset: "Chipset",
  manufacturer: "Fabricante",
  boost_mhz: "Boost",
  base_mhz: "Base",
  memory_bus: "Bus memória",
  pcie: "PCIe",
  tdp_w: "Consumo (TDP)",
  power_w: "Consumo",
  hdmi: "HDMI",
  displayport: "DisplayPort",
  length_mm: "Comprimento",
  rgb: "RGB",
  series: "Série",
  model: "Modelo",
  cpu: "CPU",
  processor: "Processador",
  ram_gb: "RAM",
  memory_gb: "Memória",
  capacity_gb: "Capacidade",
  ssd: "SSD",
  gpu: "GPU",
  screen_size: "Ecrã",
  panel: "Painel",
  refresh_rate: "Taxa de atualização",
  weight_kg: "Peso",
  resolution: "Resolução",
  camera: "Câmara",
  battery_mah: "Bateria",
  os: "Sistema",
  interface: "Interface",
  read_mb_s: "Leitura",
  write_mb_s: "Escrita",
  form_factor: "Formato",
  cores: "Núcleos",
  threads: "Threads",
  socket: "Socket",
  brand: "Marca",
  color: "Cor",
  storage: "Armazenamento",
};

function leafKey(product: Product): string {
  return (
    product.leafId ||
    product.subcategory ||
    ""
  )
    .toLowerCase()
    .trim();
}

export function parseTypedAttributes(
  raw: Record<string, unknown> | string | null | undefined,
): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) return { ...raw };
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function formatAttrValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    const t = value.trim();
    return t || null;
  }
  if (Array.isArray(value)) {
    const parts = value.map((v) => formatAttrValue(v)).filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  return null;
}

export function buildSpecRows(product: Product): SpecRow[] {
  const attrs = {
    ...parseTypedAttributes(product.typedAttributes),
  };
  if (product.chipsetModel && !attrs.chipset) attrs.chipset = product.chipsetModel;
  if (product.vramSpec && !attrs.vram_gb) attrs.vram_gb = product.vramSpec;
  if (product.brand && !attrs.brand) attrs.brand = product.brand;

  const leaf = leafKey(product);
  const preferred = ATTR_ORDER[leaf] || ATTR_ORDER[leaf.replace(/s$/, "")] || [];
  const keys = [
    ...preferred.filter((k) => k in attrs),
    ...Object.keys(attrs).filter((k) => !preferred.includes(k)),
  ];

  const rows: SpecRow[] = [];
  for (const key of keys) {
    const formatted = formatAttrValue(attrs[key]);
    if (!formatted) continue;
    rows.push({
      key,
      label: ATTR_LABELS[key] || key.replace(/_/g, " "),
      value: formatted,
    });
  }
  return rows;
}

export function buildAutoDescription(product: Product): {
  summary: string;
  features: string[];
  benefits: string[];
} {
  const specs = buildSpecRows(product);
  const leaf =
    product.subcategoryLabel ||
    product.leafId?.replace(/_/g, " ") ||
    product.category ||
    "produto";
  const brand = product.brand?.trim();

  let summary: string;
  if (brand && specs.length >= 2) {
    summary = `${product.name} é um ${leaf.toLowerCase()} ${brand} observado no Limiar. Comparamos preços nas lojas portuguesas com base no histórico real — sem inventar especificações.`;
  } else if (brand) {
    summary = `${product.name} (${brand}) — categoria ${leaf}. Consulte preços, lojas e histórico no Limiar.`;
  } else if (specs.length) {
    summary = `${product.name} — ${leaf}. Características abaixo derivam apenas dos dados de catálogo disponíveis.`;
  } else {
    summary = `${product.name} está no catálogo Limiar. Ainda temos poucos atributos técnicos indexados — use o histórico e as lojas para decidir.`;
  }

  const features = specs.slice(0, 6).map((s) => `${s.label}: ${s.value}`);

  const benefits: string[] = [];
  if (product.offers.length > 1) {
    benefits.push(`Disponível em ${product.offers.length} lojas observadas.`);
  }
  if (product.decision.isHistoricalMin) {
    benefits.push("Preço actual próximo do mínimo histórico observado.");
  }
  if (product.storeCouponsAvailable) {
    benefits.push("Há cupões ou campanhas informativas associadas a lojas.");
  }
  if (!benefits.length) {
    benefits.push("Compare o preço actual com o histórico antes de comprar.");
  }

  return { summary, features, benefits };
}

export type ProductFaqItem = { question: string; answer: string };

export function buildProductFaq(product: Product): ProductFaqItem[] {
  const condition = (product.condition || "NEW").toUpperCase();
  const conditionLabel =
    condition === "NEW"
      ? "novo"
      : condition === "OPEN_BOX"
        ? "caixa aberta"
        : condition === "OUTLET"
          ? "outlet"
          : condition === "REFURBISHED"
            ? "recondicionado"
            : condition.toLowerCase();

  const stores = product.offers
    .map((o) => o.storeName || o.store)
    .filter(Boolean)
    .slice(0, 6);

  const items: ProductFaqItem[] = [
    {
      question: "Este produto é novo?",
      answer:
        condition === "NEW"
          ? "O estado observado no Limiar é Novo, com base nos dados das lojas."
          : `O estado observado é «${conditionLabel}». Confirme sempre na página da loja antes de comprar.`,
    },
    {
      question: "Qual o preço mais baixo observado?",
      answer: `O mínimo histórico registado no Limiar é ${product.historicalMin.toFixed(2)} € (dados observados, sem previsões).`,
    },
  ];

  if (stores.length) {
    items.push({
      question: "Em que lojas está disponível?",
      answer: `Lojas com oferta observada: ${stores.join(", ")}.`,
    });
  }

  items.push({
    question: "Quando costuma baixar?",
    answer:
      "O Limiar não prevê descidas futuras. Use o gráfico de histórico e o Índice Limiar para ver se o momento actual é favorável face ao passado observado.",
  });

  items.push({
    question: "Tem garantia?",
    answer:
      "A garantia depende da loja e do estado do produto. Consulte os termos na página do retalhista antes de concluir a compra.",
  });

  return items;
}

export function collectImageUrls(product: Product): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const u of product.imageUrls || []) {
    if (u && !seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  }
  if (product.imageUrl && !seen.has(product.imageUrl)) {
    urls.unshift(product.imageUrl);
  }
  return urls;
}
