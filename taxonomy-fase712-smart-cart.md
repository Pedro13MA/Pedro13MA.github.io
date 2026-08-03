# FASE 7.12 — Compra Inteligente (Smart Cart)

**Assistente de compra** — não é checkout. Motor Limiar, ranking, pesquisa, taxonomy, histórico, Scheduler e Telegram **inalterados**.

## Arquitectura (pronta para FASE 8)

```text
UI (/carrinho, botões)
  → smart-cart service
  → SmartCartStorageAdapter
       ├─ LocalSmartCartAdapter  (activo)
       └─ CloudSmartCartAdapter  (stub)
```

Tipos: `CartItem`, `CartConfig`, `CartPriceAlert`, `OptimizeOption`.  
Kinds futuros: `pc_build`, `bundle_gaming`, `wedding`, `office`, `streaming`, `nas`, `university`.

## Otimização

| Estratégia | Comportamento |
| --- | --- |
| A Menor preço | Cada item na loja mais barata |
| B Menos lojas | Menor nº de lojas, depois menor total |
| C Equilíbrio | Total + penalização heurística por loja (não é porte) |

Portes: só se `shippingCostEur` conhecido; senão **n/d** (nunca inventar).

## Funcionalidades

- `/carrinho` — lista, qtd, loja preferida, estado (faltacomprar / comprei / reservado)
- Timeline preço adicionado vs actual
- Otimizar compra + comparação de estratégias
- Alternativas / troca inteligente (lazy)
- Configurações guardadas (Gaming, PC Trabalho…)
- Alerta «baixar X €» (local)
- Export PDF / CSV / partilha
- Botão em produto, cards, comparador
- Menu Minha Área → Carrinho

## Critérios

- [x] Smart Cart funcional
- [x] Otimização A/B/C
- [x] Portes opcionais
- [x] Prep. PC / bundles / cloud
- [x] Zero alterações motor / ranking / pesquisa / taxonomy
- [x] Testes a passar
