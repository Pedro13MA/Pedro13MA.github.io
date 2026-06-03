import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pedro13ma.github.io"),
  title: {
    default: "Spotter Intelligence Hub — Price Intelligence para Tech & Gaming",
    template: "%s | Spotter Intelligence Hub",
  },
  description:
    "Motor autónomo de price intelligence para Portugal. Monitoriza feeds oficiais, valida descontos reais e publica deals curados no Telegram @spotter_deals.",
  keywords: [
    "deals portugal telegram",
    "alertas preço tech gaming",
    "descontos validados portugal",
    "price intelligence portugal",
    "ofertas pc componentes telegram",
  ],
  authors: [{ name: "Pedro Martins" }],
  creator: "Pedro Martins",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://pedro13ma.github.io",
    siteName: "Spotter Intelligence Hub",
    title: "Spotter Intelligence Hub — Descontos reais, validados",
    description:
      "Price intelligence autónoma para tech, gaming e eletro. Só deals S/A no canal. Telegram @spotter_deals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotter Intelligence Hub",
    description: "Descontos reais validados — antes de tu os veres.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://pedro13ma.github.io" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Spotter Intelligence Hub",
      url: "https://pedro13ma.github.io",
      description: "Motor de price intelligence para o mercado português",
      founder: { "@type": "Person", name: "Pedro Martins" },
      areaServed: "PT",
    },
    {
      "@type": "WebSite",
      name: "Spotter Intelligence Hub",
      url: "https://pedro13ma.github.io",
      inLanguage: "pt-PT",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased pb-20 md:pb-0">
        {children}
      </body>
    </html>
  );
}
