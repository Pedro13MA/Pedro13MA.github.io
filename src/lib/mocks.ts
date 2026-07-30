import type { Product, Promotion } from "@/lib/types";

function historySeries(
  start: number,
  end: number,
  points: number,
  wobble = 0.04,
): { date: string; price: number }[] {
  const out: { date: string; price: number }[] = [];
  const now = new Date("2026-07-28T12:00:00Z");
  for (let i = points - 1; i >= 0; i -= 1) {
    const t = (points - 1 - i) / (points - 1);
    const base = start + (end - start) * t;
    const noise = Math.sin(i * 1.7) * start * wobble;
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push({
      date: d.toISOString().slice(0, 10),
      price: Math.round((base + noise) * 100) / 100,
    });
  }
  return out;
}

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    externalId: "awin-99101",
    merchantId: "3744",
    storeName: "PC Componentes",
    storeSlug: "pccomponentes",
    title: "10% OFF em periféricos selecionados",
    description: "Válido em compras acima de 50€",
    code: "SAVE10",
    url: "https://www.awin1.com/cread.php?awinmid=3744&awinaffid=2917249",
    promotionType: "voucher",
    discountKind: "percent",
    discountValue: 10,
    startDate: "2026-07-20T00:00:00Z",
    endDate: "2026-08-15T23:59:59Z",
    isActive: true,
  },
  {
    externalId: "awin-99102",
    merchantId: "1001",
    storeName: "Worten",
    storeSlug: "worten",
    title: "15€ em smartphones",
    description: "Cupão app Worten",
    code: "WORTEN15",
    url: "https://www.awin1.com/cread.php?awinmid=1001&awinaffid=2917249",
    promotionType: "voucher",
    discountKind: "amount",
    discountValue: 15,
    startDate: "2026-07-25T00:00:00Z",
    endDate: "2026-08-05T23:59:59Z",
    isActive: true,
  },
  {
    externalId: "awin-99103",
    merchantId: "2200",
    storeName: "Fnac",
    storeSlug: "fnac",
    title: "5% em gaming",
    description: "Exclusivo afiliados",
    code: "FNAC5",
    url: "https://www.awin1.com/cread.php?awinmid=2200&awinaffid=2917249",
    promotionType: "voucher",
    discountKind: "percent",
    discountValue: 5,
    startDate: "2026-07-01T00:00:00Z",
    endDate: "2026-08-31T23:59:59Z",
    isActive: true,
  },
  {
    externalId: "awin-99104",
    merchantId: "3300",
    storeName: "Globaldata",
    storeSlug: "globaldata",
    title: "Promoção SSD sem código",
    description: "Desconto automático no checkout",
    code: null,
    url: "https://www.awin1.com/cread.php?awinmid=3300&awinaffid=2917249",
    promotionType: "promotion",
    discountKind: "percent",
    discountValue: 12,
    startDate: "2026-07-10T00:00:00Z",
    endDate: "2026-08-01T23:59:59Z",
    isActive: true,
  },
  {
    externalId: "awin-99105",
    merchantId: "1001",
    storeName: "Worten",
    storeSlug: "worten",
    title: "10% em eletrodomésticos",
    description: "Código único por cliente",
    code: "WORTEN10",
    url: "https://www.awin1.com/cread.php?awinmid=1001&awinaffid=2917249",
    promotionType: "voucher",
    discountKind: "percent",
    discountValue: 10,
    startDate: "2026-07-15T00:00:00Z",
    endDate: "2026-08-20T23:59:59Z",
    isActive: true,
  },
  {
    externalId: "awin-99106",
    merchantId: "3300",
    storeName: "Globaldata",
    storeSlug: "globaldata",
    title: "20€ em GPUs selecionadas",
    description: "Compras acima de 400€",
    code: "GPU20",
    url: "https://www.awin1.com/cread.php?awinmid=3300&awinaffid=2917249",
    promotionType: "voucher",
    discountKind: "amount",
    discountValue: 20,
    startDate: "2026-07-22T00:00:00Z",
    endDate: "2026-08-10T23:59:59Z",
    isActive: true,
  },
];

/** @deprecated Use `@/lib/coupon-stores` — mantido para compat SSG legado. */
export { COUPON_HUB_STORES } from "@/lib/coupon-stores";

/** @deprecated Códigos hardcoded removidos — SSG usa API Limiar. */
export const KNOWN_COUPON_CODES: string[] = [];

export const MOCK_PRODUCTS: Product[] = [
  {
    slug: "samsung-990-pro-2tb",
    ean: "8806094934155",
    name: "Samsung 990 PRO 2TB NVMe SSD",
    brand: "Samsung",
    category: "Hardware",
    imageUrl:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=640&h=640&fit=crop",
    currency: "EUR",
    currentPrice: 149.9,
    avg30d: 179.5,
    historicalMin: 149.9,
    historicalMax: 219.99,
    dropTodayPct: 7.2,
    history: historySeries(205, 149.9, 60, 0.03),
    offers: [
      {
        store: "pccomponentes",
        storeName: "PC Componentes",
        url: "https://www.awin1.com/cread.php?awinmid=3744&p=ssd-990pro",
        price: 149.9,
        originalPrice: 189.9,
        inStock: true,
        couponCode: "SAVE10",
        couponLabel: "10% OFF",
      },
      {
        store: "globaldata",
        storeName: "Globaldata",
        url: "https://www.awin1.com/cread.php?awinmid=3300&p=ssd-990pro",
        price: 154.99,
        originalPrice: 179.99,
        inStock: true,
      },
      {
        store: "worten",
        storeName: "Worten",
        url: "https://www.awin1.com/cread.php?awinmid=1001&p=ssd-990pro",
        price: 169.99,
        originalPrice: 189.99,
        inStock: true,
      },
      {
        store: "fnac",
        storeName: "Fnac",
        url: "https://www.awin1.com/cread.php?awinmid=2200&p=ssd-990pro",
        price: 174.99,
        originalPrice: 199.99,
        inStock: false,
      },
    ],
    decision: {
      finalScore: 0.91,
      publish: true,
      tier: "S",
      reason: "NEW_LOW below 30d average with multi-store confirmation",
      breakdown: {
        baseQuality: 0.3,
        priceOpportunity: 0.35,
        trend: 0.12,
        rarity: 0.1,
        categoryOverload: -0.02,
        storeDominance: 0.04,
        feedbackAdjustment: 0.02,
      },
      discountPct: 16.5,
      zScore: -2.1,
      dealQuality: "VERY_GOOD_DEAL",
      opportunityType: "NEW_LOW",
      historicalAvg: 179.5,
      historicalMin: 149.9,
      isHistoricalMin: true,
      cheapestStore: "pccomponentes",
      feedCategory: "storage_power",
      semaphore: "buy",
      bullets: [
        "Menor preço dos últimos 90 dias — 16,5% abaixo da média de 30 dias (€179,50)",
        "Coincide com o mínimo histórico registado (€149,90)",
        "Historicamente esteve abaixo deste valor em 0 ocasiões nos últimos 12 meses",
        "Cupão SAVE10 aplicável na PC Componentes (melhor preço multi-loja)",
      ],
      limiarIndex: {
        value: 96,
        summary: "Menor preço dos últimos 90 dias, 16,5% abaixo da média",
        factors: {
          vsAvg30d: {
            score: 28,
            label: "Preço vs média 30d",
            detail: "16,5% abaixo de €179,50",
          },
          historicalMin: {
            score: 30,
            label: "Mínimo histórico",
            detail: "Igual ao mínimo registado (€149,90)",
          },
          couponApplied: {
            score: 22,
            label: "Cupão aplicado",
            detail: "SAVE10 ativo na melhor oferta",
          },
          volatility: {
            score: 16,
            label: "Volatilidade",
            detail: "Amplitude 60d moderada (±3%)",
          },
        },
      },
    },
    seasonality: {
      timesBelowCurrent12m: 0,
      note: "Padrão promocional mais frequente em novembro (Black Friday) e julho (campanhas de verão).",
      markers: [
        { month: 1, label: "Janeiro", kind: "neutral" },
        { month: 2, label: "Fevereiro", kind: "neutral" },
        { month: 3, label: "Março", kind: "neutral" },
        { month: 4, label: "Abril", kind: "neutral" },
        { month: 5, label: "Maio", kind: "neutral" },
        { month: 6, label: "Junho", kind: "promo" },
        { month: 7, label: "Julho", kind: "promo" },
        { month: 8, label: "Agosto", kind: "neutral" },
        { month: 9, label: "Regresso às Aulas", kind: "promo" },
        { month: 10, label: "Outubro", kind: "neutral" },
        { month: 11, label: "Black Friday", kind: "promo" },
        { month: 12, label: "Dezembro", kind: "peak" },
      ],
    },
    activePromotion: MOCK_PROMOTIONS[0],
  },
  {
    slug: "sony-wh-1000xm5",
    ean: "4548736132432",
    name: "Sony WH-1000XM5 Auscultadores",
    brand: "Sony",
    category: "Peripherals",
    imageUrl:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=640&h=640&fit=crop",
    currency: "EUR",
    currentPrice: 279.0,
    avg30d: 299.0,
    historicalMin: 249.0,
    historicalMax: 379.0,
    dropTodayPct: 3.1,
    history: historySeries(320, 279, 60, 0.025),
    offers: [
      {
        store: "fnac",
        storeName: "Fnac",
        url: "https://www.awin1.com/cread.php?awinmid=2200&p=xm5",
        price: 279.0,
        originalPrice: 349.0,
        inStock: true,
        couponCode: "FNAC5",
        couponLabel: "5% gaming/áudio",
      },
      {
        store: "worten",
        storeName: "Worten",
        url: "https://www.awin1.com/cread.php?awinmid=1001&p=xm5",
        price: 289.99,
        originalPrice: 349.99,
        inStock: true,
        couponCode: "WORTEN15",
        couponLabel: "15€ cupão",
      },
      {
        store: "pccomponentes",
        storeName: "PC Componentes",
        url: "https://www.awin1.com/cread.php?awinmid=3744&p=xm5",
        price: 294.9,
        originalPrice: 329.9,
        inStock: true,
      },
    ],
    decision: {
      finalScore: 0.72,
      publish: true,
      tier: "A",
      reason: "RETURNED_DEAL near fair band",
      breakdown: {
        baseQuality: 0.25,
        priceOpportunity: 0.2,
        trend: 0.08,
        rarity: 0.05,
        categoryOverload: 0,
        storeDominance: 0.05,
        feedbackAdjustment: 0.09,
      },
      discountPct: 6.7,
      zScore: -1.2,
      dealQuality: "FAIR_DEAL",
      opportunityType: "RETURNED_DEAL",
      historicalAvg: 299.0,
      historicalMin: 249.0,
      isHistoricalMin: false,
      cheapestStore: "fnac",
      feedCategory: "peripherals",
      semaphore: "fair",
      bullets: [
        "Dentro do intervalo normal de preço registado (6,7% abaixo da média de 30 dias)",
        "Ainda €30 acima do mínimo histórico (€249,00)",
        "Historicamente esteve abaixo deste valor em 4 ocasiões nos últimos 12 meses",
      ],
      limiarIndex: {
        value: 64,
        summary: "Dentro do intervalo normal de preço registado",
        factors: {
          vsAvg30d: {
            score: 18,
            label: "Preço vs média 30d",
            detail: "6,7% abaixo de €299,00",
          },
          historicalMin: {
            score: 12,
            label: "Mínimo histórico",
            detail: "€30 acima do mínimo (€249,00)",
          },
          couponApplied: {
            score: 16,
            label: "Cupão aplicado",
            detail: "FNAC5 disponível na melhor loja",
          },
          volatility: {
            score: 18,
            label: "Volatilidade",
            detail: "Oscilação habitual em áudio ANC",
          },
        },
      },
    },
    seasonality: {
      timesBelowCurrent12m: 4,
      note: "Quedas mais frequentes em novembro (Black Friday) e julho (Prime Days / campanhas de verão).",
      markers: [
        { month: 1, label: "Janeiro", kind: "neutral" },
        { month: 2, label: "Fevereiro", kind: "neutral" },
        { month: 3, label: "Março", kind: "neutral" },
        { month: 4, label: "Abril", kind: "neutral" },
        { month: 5, label: "Maio", kind: "neutral" },
        { month: 6, label: "Junho", kind: "neutral" },
        { month: 7, label: "Prime Days", kind: "promo" },
        { month: 8, label: "Agosto", kind: "neutral" },
        { month: 9, label: "Setembro", kind: "neutral" },
        { month: 10, label: "Outubro", kind: "neutral" },
        { month: 11, label: "Black Friday", kind: "promo" },
        { month: 12, label: "Natal", kind: "peak" },
      ],
    },
    activePromotion: MOCK_PROMOTIONS[2],
  },
  {
    slug: "logitech-g-pro-x-superlight-2",
    ean: "5099206104475",
    name: "Logitech G Pro X Superlight 2",
    brand: "Logitech",
    category: "Gaming",
    imageUrl:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=640&h=640&fit=crop",
    currency: "EUR",
    currentPrice: 129.99,
    avg30d: 124.5,
    historicalMin: 99.9,
    historicalMax: 159.9,
    dropTodayPct: -1.2,
    history: historySeries(118, 129.99, 60, 0.035),
    offers: [
      {
        store: "worten",
        storeName: "Worten",
        url: "https://www.awin1.com/cread.php?awinmid=1001&p=superlight2",
        price: 129.99,
        originalPrice: 149.99,
        inStock: true,
      },
      {
        store: "fnac",
        storeName: "Fnac",
        url: "https://www.awin1.com/cread.php?awinmid=2200&p=superlight2",
        price: 134.99,
        originalPrice: 149.99,
        inStock: true,
      },
      {
        store: "globaldata",
        storeName: "Globaldata",
        url: "https://www.awin1.com/cread.php?awinmid=3300&p=superlight2",
        price: 139.9,
        originalPrice: 154.9,
        inStock: true,
      },
    ],
    decision: {
      finalScore: 0.38,
      publish: false,
      tier: "B",
      reason: "NOISE — above recent average",
      breakdown: {
        baseQuality: 0.15,
        priceOpportunity: -0.05,
        trend: -0.08,
        rarity: 0.02,
        categoryOverload: -0.05,
        storeDominance: 0.02,
        feedbackAdjustment: 0,
      },
      discountPct: -4.4,
      zScore: 0.4,
      dealQuality: "NORMAL",
      opportunityType: "NOISE",
      historicalAvg: 124.5,
      historicalMin: 99.9,
      isHistoricalMin: false,
      cheapestStore: "worten",
      feedCategory: "tech_gaming",
      semaphore: "wait",
      bullets: [
        "Atualmente 4,4% acima da média dos últimos 30 dias (€124,50)",
        "Mínimo histórico registado: €99,90",
        "Historicamente esteve abaixo deste valor em 7 ocasiões nos últimos 12 meses",
      ],
      limiarIndex: {
        value: 32,
        summary: "Atualmente 4,4% acima da média dos últimos 30 dias",
        factors: {
          vsAvg30d: {
            score: 4,
            label: "Preço vs média 30d",
            detail: "4,4% acima de €124,50",
          },
          historicalMin: {
            score: 6,
            label: "Mínimo histórico",
            detail: "€30 acima do mínimo (€99,90)",
          },
          couponApplied: {
            score: 8,
            label: "Cupão aplicado",
            detail: "Sem cupão ativo nas ofertas atuais",
          },
          volatility: {
            score: 14,
            label: "Volatilidade",
            detail: "Produto com quedas frequentes em campanhas",
          },
        },
      },
    },
    seasonality: {
      timesBelowCurrent12m: 7,
      note: "Valores promocionais recorrentes em Black Friday, Regresso às Aulas e campanhas de gaming.",
      markers: [
        { month: 1, label: "Janeiro", kind: "neutral" },
        { month: 2, label: "Fevereiro", kind: "neutral" },
        { month: 3, label: "Março", kind: "neutral" },
        { month: 4, label: "Abril", kind: "neutral" },
        { month: 5, label: "Maio", kind: "neutral" },
        { month: 6, label: "Junho", kind: "neutral" },
        { month: 7, label: "Julho", kind: "promo" },
        { month: 8, label: "Agosto", kind: "neutral" },
        { month: 9, label: "Regresso às Aulas", kind: "promo" },
        { month: 10, label: "Outubro", kind: "neutral" },
        { month: 11, label: "Black Friday", kind: "promo" },
        { month: 12, label: "Dezembro", kind: "peak" },
      ],
    },
  },
  {
    slug: "apple-iphone-16-128gb",
    ean: "195949035128",
    name: "Apple iPhone 16 128GB",
    brand: "Apple",
    category: "Smartphones",
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=640&h=640&fit=crop",
    currency: "EUR",
    currentPrice: 849.0,
    avg30d: 929.0,
    historicalMin: 849.0,
    historicalMax: 979.0,
    dropTodayPct: 5.8,
    history: historySeries(960, 849, 60, 0.015),
    offers: [
      {
        store: "worten",
        storeName: "Worten",
        url: "https://www.awin1.com/cread.php?awinmid=1001&p=iphone16",
        price: 849.0,
        originalPrice: 979.0,
        inStock: true,
        couponCode: "WORTEN15",
        couponLabel: "15€ cupão",
      },
      {
        store: "fnac",
        storeName: "Fnac",
        url: "https://www.awin1.com/cread.php?awinmid=2200&p=iphone16",
        price: 859.0,
        originalPrice: 979.0,
        inStock: true,
      },
      {
        store: "pccomponentes",
        storeName: "PC Componentes",
        url: "https://www.awin1.com/cread.php?awinmid=3744&p=iphone16",
        price: 879.0,
        originalPrice: 969.0,
        inStock: true,
      },
    ],
    decision: {
      finalScore: 0.88,
      publish: true,
      tier: "S",
      reason: "NEW_LOW on flagship smartphone",
      breakdown: {
        baseQuality: 0.28,
        priceOpportunity: 0.32,
        trend: 0.15,
        rarity: 0.08,
        categoryOverload: 0,
        storeDominance: 0.03,
        feedbackAdjustment: 0.02,
      },
      discountPct: 8.6,
      zScore: -1.9,
      dealQuality: "GOOD_DEAL",
      opportunityType: "NEW_LOW",
      historicalAvg: 929.0,
      historicalMin: 849.0,
      isHistoricalMin: true,
      cheapestStore: "worten",
      feedCategory: "mobile",
      semaphore: "buy",
      bullets: [
        "Menor preço dos últimos 90 dias — 8,6% abaixo da média de 30 dias (€929,00)",
        "Coincide com o mínimo histórico registado (€849,00)",
        "Historicamente esteve abaixo deste valor em 0 ocasiões nos últimos 12 meses",
        "Cupão WORTEN15 ativo na melhor oferta",
      ],
      limiarIndex: {
        value: 91,
        summary: "Menor preço dos últimos 90 dias, 8,6% abaixo da média",
        factors: {
          vsAvg30d: {
            score: 24,
            label: "Preço vs média 30d",
            detail: "8,6% abaixo de €929,00",
          },
          historicalMin: {
            score: 30,
            label: "Mínimo histórico",
            detail: "Igual ao mínimo registado (€849,00)",
          },
          couponApplied: {
            score: 20,
            label: "Cupão aplicado",
            detail: "WORTEN15 (−15€) na Worten",
          },
          volatility: {
            score: 17,
            label: "Volatilidade",
            detail: "Flagship com quedas pontuais em campanhas",
          },
        },
      },
    },
    seasonality: {
      timesBelowCurrent12m: 0,
      note: "Quedas tipicamente associadas a lançamentos (setembro) e Black Friday.",
      markers: [
        { month: 1, label: "Janeiro", kind: "neutral" },
        { month: 2, label: "Fevereiro", kind: "neutral" },
        { month: 3, label: "Março", kind: "neutral" },
        { month: 4, label: "Abril", kind: "neutral" },
        { month: 5, label: "Maio", kind: "neutral" },
        { month: 6, label: "Junho", kind: "neutral" },
        { month: 7, label: "Julho", kind: "promo" },
        { month: 8, label: "Agosto", kind: "neutral" },
        { month: 9, label: "Lançamento", kind: "peak" },
        { month: 10, label: "Outubro", kind: "neutral" },
        { month: 11, label: "Black Friday", kind: "promo" },
        { month: 12, label: "Natal", kind: "peak" },
      ],
    },
    activePromotion: MOCK_PROMOTIONS[1],
  },
  {
    slug: "lg-oled65-c4",
    ean: "8806091951234",
    name: "LG OLED65C4 65\" 4K",
    brand: "LG",
    category: "Casa",
    imageUrl:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=640&h=640&fit=crop",
    currency: "EUR",
    currentPrice: 1899.0,
    avg30d: 1749.0,
    historicalMin: 1499.0,
    historicalMax: 2199.0,
    dropTodayPct: -2.4,
    history: historySeries(1700, 1899, 60, 0.02),
    offers: [
      {
        store: "worten",
        storeName: "Worten",
        url: "https://www.awin1.com/cread.php?awinmid=1001&p=oledc4",
        price: 1899.0,
        originalPrice: 2199.0,
        inStock: true,
      },
      {
        store: "fnac",
        storeName: "Fnac",
        url: "https://www.awin1.com/cread.php?awinmid=2200&p=oledc4",
        price: 1929.0,
        originalPrice: 2199.0,
        inStock: true,
      },
      {
        store: "globaldata",
        storeName: "Globaldata",
        url: "https://www.awin1.com/cread.php?awinmid=3300&p=oledc4",
        price: 1949.0,
        originalPrice: 2099.0,
        inStock: true,
      },
    ],
    decision: {
      finalScore: 0.29,
      publish: false,
      tier: "B",
      reason: "Above habitual TV pricing window",
      breakdown: {
        baseQuality: 0.12,
        priceOpportunity: -0.1,
        trend: -0.06,
        rarity: 0.02,
        categoryOverload: -0.04,
        storeDominance: 0.01,
        feedbackAdjustment: 0,
      },
      discountPct: -8.6,
      zScore: 0.9,
      dealQuality: "NORMAL",
      opportunityType: "NOISE",
      historicalAvg: 1749.0,
      historicalMin: 1499.0,
      isHistoricalMin: false,
      cheapestStore: "worten",
      feedCategory: "home_appliances",
      semaphore: "wait",
      bullets: [
        "Atualmente 8,6% acima da média dos últimos 30 dias (€1.749,00)",
        "Mínimo histórico registado: €1.499,00",
        "Historicamente esteve abaixo deste valor em 9 ocasiões nos últimos 12 meses",
      ],
      limiarIndex: {
        value: 28,
        summary: "Atualmente 8,6% acima da média dos últimos 30 dias",
        factors: {
          vsAvg30d: {
            score: 3,
            label: "Preço vs média 30d",
            detail: "8,6% acima de €1.749,00",
          },
          historicalMin: {
            score: 5,
            label: "Mínimo histórico",
            detail: "€400 acima do mínimo (€1.499,00)",
          },
          couponApplied: {
            score: 6,
            label: "Cupão aplicado",
            detail: "Sem cupão validado neste momento",
          },
          volatility: {
            score: 14,
            label: "Volatilidade",
            detail: "TVs OLED com quedas fortes em Black Friday",
          },
        },
      },
    },
    seasonality: {
      timesBelowCurrent12m: 9,
      note: "Picos promocionais em Black Friday e campanhas de verão; Natal costuma ser pico de procura.",
      markers: [
        { month: 1, label: "Janeiro", kind: "promo" },
        { month: 2, label: "Fevereiro", kind: "neutral" },
        { month: 3, label: "Março", kind: "neutral" },
        { month: 4, label: "Abril", kind: "neutral" },
        { month: 5, label: "Maio", kind: "neutral" },
        { month: 6, label: "Junho", kind: "promo" },
        { month: 7, label: "Julho", kind: "promo" },
        { month: 8, label: "Agosto", kind: "neutral" },
        { month: 9, label: "Setembro", kind: "neutral" },
        { month: 10, label: "Outubro", kind: "neutral" },
        { month: 11, label: "Black Friday", kind: "promo" },
        { month: 12, label: "Natal", kind: "peak" },
      ],
    },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug || p.ean === slug);
}

/** Secção 1: mínimo histórico + Índice Limiar > 85 */
export function getBuyNowProducts(): Product[] {
  return MOCK_PRODUCTS.filter(
    (p) => p.decision.isHistoricalMin && p.decision.limiarIndex.value > 85,
  ).sort((a, b) => b.decision.limiarIndex.value - a.decision.limiarIndex.value);
}

/** Secção 2: popular acima do habitual + Índice Limiar < 50 */
export function getWaitProducts(): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.decision.limiarIndex.value < 50).sort(
    (a, b) => a.decision.limiarIndex.value - b.decision.limiarIndex.value,
  );
}

/** Secção 3: maiores quedas de hoje */
export function getBiggestDropsToday(): Product[] {
  return [...MOCK_PRODUCTS]
    .filter((p) => (p.dropTodayPct ?? 0) > 0)
    .sort((a, b) => (b.dropTodayPct ?? 0) - (a.dropTodayPct ?? 0));
}

/** @deprecated Hub usa apenas GET /coupons (Awin). Não devolver mocks. */
export function getActivePromotions(): Promotion[] {
  return [];
}

export function getPromotionsByStore(_storeSlug: string): Promotion[] {
  return [];
}

export function getDailyOpportunities(): Product[] {
  return getBuyNowProducts();
}
