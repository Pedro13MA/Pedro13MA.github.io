/** Labels PT para reference_source (Limiar v2). */

export type ReferenceSource =
  | "HISTORY_30D"
  | "MARKET_MEDIAN"
  | "MSRP_CAPPED"
  | "NONE"
  | string;

const LABELS: Record<string, string> = {
  HISTORY_30D: "Média últimos 30 dias",
  MARKET_MEDIAN: "Média de Mercado",
  MSRP_CAPPED: "PVPR Ajustado",
  NONE: "Sem referência",
};

const TOOLTIPS: Record<string, string> = {
  HISTORY_30D: "Calculado face aos últimos 30 dias",
  MARKET_MEDIAN: "Calculado face à média de mercado",
  MSRP_CAPPED: "Calculado face ao PVPR ajustado",
  NONE: "Sem preço de referência suficiente",
};

export function referenceSourceLabelPt(source?: string | null): string {
  if (!source) return LABELS.NONE;
  return LABELS[source] ?? source;
}

export function referenceSourceTooltip(source?: string | null): string {
  if (!source) return TOOLTIPS.NONE;
  return TOOLTIPS[source] ?? `Referência: ${referenceSourceLabelPt(source)}`;
}
