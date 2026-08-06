/**
 * Host oficial da API Lymiar.
 * Override: NEXT_PUBLIC_API_URL
 */
const DEFAULT_API_URL = "https://api.lymiar.com";

export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).trim();
  return raw.replace(/\/$/, "");
}
