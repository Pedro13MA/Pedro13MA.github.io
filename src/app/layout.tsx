import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3, JetBrains_Mono } from "next/font/google";
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
    "A plataforma que diz quando vale realmente a pena comprar. Histórico de preços, melhores momentos e comparação multi-loja.",
  keywords: [
    "limiar",
    "price intelligence portugal",
    "devo comprar agora",
    "histórico de preços",
    "comparador lojas portugal",
  ],
  authors: [{ name: "Pedro Martins" }],
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://pedro13ma.github.io",
    siteName: "Limiar",
    title: "Limiar — Quando vale realmente a pena comprar",
    description:
      "Histórico de preços, melhores momentos para comprar e comparação entre lojas.",
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
        {children}
      </body>
    </html>
  );
}
