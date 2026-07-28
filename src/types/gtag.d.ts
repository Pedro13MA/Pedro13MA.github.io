export {};

type GtagCommand = "config" | "event" | "js" | "set" | "consent";

type GtagFunction = (
  command: GtagCommand,
  targetOrEventName: string | Date,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFunction;
    dataLayer?: unknown[];
  }
}
