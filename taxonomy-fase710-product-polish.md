# FASE 7.10 — Product Page Polish (UX + Mobile + Conteúdo)

**Só qualidade de experiência.** Sem funcionalidades novas. Motor Lymiar, pesquisa, ranking, taxonomy, preços, histórico, API, Scheduler e Telegram **inalterados**.

## Mudanças

| Área | Resultado |
| --- | --- |
| Mobile | Fluxo marketplace: imagem → preço → decisão → Comprar → lojas → descrição → histórico → semelhantes |
| Hero | Compacto; marca; categoria real; preço; loja; stock; score; poupança; Comprar / VS / Favorito / Alerta |
| «Other» | Nunca mostrado (breadcrumb, hero, descrição) — fallback marca ou ocultar |
| Descrição | Só com `typed_attributes` / chipset / VRAM úteis; senão secção oculta |
| Specs | Cartões (Marca / Chip / VRAM…) |
| Variantes | Só capacidade ou cor distintas; secção oculta se vazia |
| Semelhantes | Prioridade leaf → chip → marca → gama → preço |
| Lojas | Cards mobile + tabela desktop; Melhor preço / Entrega / Confiança |
| KPIs | Faixa compacta horizontal |
| Histórico | Hover rico, brush zoom, mín/máx, eventos cupão/promo |
| SEO | title/description/OG + Schema.org Product |
| FAQ | Só perguntas com resposta conhecida |

## Ficheiros principais

- `src/lib/product-display.ts` — labels sem Other
- `src/lib/product-content.ts` — descrições úteis
- `src/components/product/ProductHero.tsx` (+ gallery, KPIs, stores, page client)
- `src/components/charts/PriceHistoryChart.tsx` — brush + tooltip
- `src/app/p/[slug]/page.tsx` — metadata

## Critérios

- [x] Mobile revista
- [x] Hero premium
- [x] Sem «Other»
- [x] Descrições úteis / ocultas
- [x] Variantes reais
- [x] Semelhantes melhores
- [x] Tabela lojas premium
- [x] Histórico melhor
- [x] SEO melhor
- [x] Zero alterações motor / pesquisa / ranking / taxonomy / backend
