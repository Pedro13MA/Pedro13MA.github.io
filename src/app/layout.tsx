import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Space_Grotesk, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pedro13ma.github.io"),
  title: {
    default: "Limiar — Quando vale realmente a pena comprar",
    template: "%s | Limiar",
  },
  description:
    "Comparamos o preço atual com o histórico observado para perceber se vale a pena comprar agora, esperar, ou se ainda não há dados suficientes.",
  keywords: [
    "limiar",
    "quando comprar",
    "histórico de preços portugal",
    "comparar lojas",
    "vale a pena comprar",
  ],
  authors: [{ name: "Pedro Martins" }],
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://pedro13ma.github.io",
    siteName: "Limiar",
    title: "Limiar — Quando vale realmente a pena comprar",
    description:
      "Comparamos o preço atual com o histórico observado. Comprar agora, esperar, ou ainda não sabemos.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://pedro13ma.github.io" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-PT"
      className={`light ${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-500 antialiased">
        <AppProviders>{children}</AppProviders>
        <GoogleAnalytics gaId="G-DDXSVE4ED7" />
      </body>
    </html>
  );
}
