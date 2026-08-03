"use client";

import type { MarketplaceProductCard } from "@/lib/api";
import {
  HomeEmpty,
  HomeProductCard,
  HomeScroller,
  HomeSection,
} from "@/components/home/v2/HomeShared";

export function HomeDeals({ items }: { items: MarketplaceProductCard[] }) {
  return (
    <HomeSection
      id="oportunidades"
      title="Oportunidades hoje"
      subtitle="Maior desconto observado face ao preço de lista da loja — sem inventar."
      href="/mercado/tendencias/"
    >
      {items.length ? (
        <HomeScroller>
          {items.map((p) => (
            <HomeProductCard key={p.slug || p.ean} item={p} />
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Sem descontos observados neste momento." />
      )}
    </HomeSection>
  );
}

export function HomeFeatured({ items }: { items: MarketplaceProductCard[] }) {
  return (
    <HomeSection
      title="Em destaque"
      subtitle="Produtos com desconto ou presença multi-loja observados no mercado."
    >
      {items.length ? (
        <HomeScroller>
          {items.map((p) => (
            <HomeProductCard key={p.slug || p.ean} item={p} />
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Ainda sem destaques." />
      )}
    </HomeSection>
  );
}

export function HomeRecentDrops({ items }: { items: MarketplaceProductCard[] }) {
  return (
    <HomeSection
      title="Baixaram recentemente"
      subtitle="Alterações de preço ou descontos observados — só histórico factual."
    >
      {items.length ? (
        <HomeScroller>
          {items.map((p) => (
            <HomeProductCard
              key={p.slug || p.ean}
              item={p}
              badge={
                p.changeCount != null
                  ? `${p.changeCount} alterações observadas`
                  : null
              }
            />
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Sem quedas registadas para mostrar." />
      )}
    </HomeSection>
  );
}

export function HomePopular({ items }: { items: MarketplaceProductCard[] }) {
  return (
    <HomeSection
      title="Mais lojas"
      subtitle="Produtos com mais lojas a vender — proxy factual de popularidade."
      href="/mercado/"
    >
      {items.length ? (
        <HomeScroller>
          {items.map((p) => (
            <HomeProductCard
              key={p.slug || p.ean}
              item={p}
              badge={
                p.storeCount != null ? `${p.storeCount} lojas` : null
              }
            />
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Sem dados de popularidade." />
      )}
    </HomeSection>
  );
}

export function HomeDiscovery({ items }: { items: MarketplaceProductCard[] }) {
  return (
    <HomeSection
      id="descobre"
      title="Descobre também"
      subtitle="Sugestões factuais a partir de descontos e cobertura multi-loja."
    >
      {items.length ? (
        <HomeScroller>
          {items.map((p) => (
            <HomeProductCard key={p.slug || p.ean} item={p} />
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Sem recomendações factuais neste momento." />
      )}
    </HomeSection>
  );
}

export function HomeLatestProducts({
  items,
}: {
  items: MarketplaceProductCard[];
}) {
  return (
    <HomeSection
      title="Novidades"
      subtitle="Últimos produtos adicionados ao catálogo observado."
    >
      {items.length ? (
        <HomeScroller>
          {items.map((p) => (
            <HomeProductCard key={p.slug || p.ean} item={p} />
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Sem novidades recentes." />
      )}
    </HomeSection>
  );
}
