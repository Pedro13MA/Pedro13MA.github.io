# Limiar — Frontend Web

Plataforma de **Price Intelligence & Decisão de Compra** ("Devo comprar agora ou esperar?").

Substitui a landing marketing antiga. Consome (via mocks, por agora) as estruturas do backend Limiar em Python/SQLite.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4** + componentes estilo **shadcn/ui**
- **recharts** — histórico de preço
- Export estático (`output: 'export'`) — GitHub Pages

## Desenvolvimento

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estrutura

```
src/
├── app/
│   ├── page.tsx              # Homepage (search + oportunidades + cupões)
│   └── p/[slug]/page.tsx     # Página de produto
├── components/
│   ├── ui/                   # button, badge, card, input, table
│   ├── product/              # header, decision, stores, alert, cards
│   ├── charts/               # PriceHistoryChart
│   └── layout/               # header, search
└── lib/
    ├── types.ts              # Product, Offer, Promotion, DecisionScore
    └── mock-data.ts          # dados alinhados ao motor Limiar
```

## Páginas

| Rota | Conteúdo |
|------|----------|
| `/` | Hero + pesquisa, oportunidades do dia, cupões ativos |
| `/p/[slug]` ou `/p/[ean]` | Semáforo, gráfico, multi-loja, decisão, alerta |

## Próximos passos

- Ligar API do backend Limiar (substituir `mock-data.ts`)
- Persistência de alertas (Telegram / Email)
- Auth opcional para watchlists
