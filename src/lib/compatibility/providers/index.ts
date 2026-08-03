/**
 * Registry de Rule Providers — extensível (NAS, Streaming, …).
 */

import { pcGamingProvider } from "@/lib/compatibility/providers/pc-gaming";
import type { CompatibilityRuleProvider } from "@/lib/compatibility/types";

const providers: CompatibilityRuleProvider[] = [pcGamingProvider];

export function registerCompatibilityProvider(
  provider: CompatibilityRuleProvider,
): void {
  const i = providers.findIndex((p) => p.id === provider.id);
  if (i >= 0) providers[i] = provider;
  else providers.push(provider);
}

export function getProviderForTemplate(
  templateId: string,
): CompatibilityRuleProvider | null {
  return providers.find((p) => p.templateIds.includes(templateId)) || null;
}

export function listCompatibilityProviders(): CompatibilityRuleProvider[] {
  return [...providers];
}
