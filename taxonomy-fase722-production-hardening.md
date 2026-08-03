# FASE 7.22 — Production Hardening

Polimento e estabilização UX/técnica após 7.0–7.21. **Sem** novas páginas, endpoints, serviços ou motores.

Lido: `docs/VISION.md`, `docs/PRODUCT_PRINCIPLES.md`, `docs/PRODUCT_VISION_2030.md`, `taxonomy-fase720-homepage.md`, `taxonomy-fase721-canonical-catalog.md`.

## Relatórios

| Relatório | Ficheiro |
|-----------|----------|
| UX | `ux_audit_report.md` |
| Performance | `performance_audit.md` |
| Acessibilidade | `accessibility_audit.md` |
| Consistência visual | `design_consistency_report.md` |

## Alterações realizadas (resumo)

- Remoção de componentes mortos (home legado + shells de produto não usados)
- Fim do default `"Other"` em `summaryToProduct` / `detailToProduct`
- PDF produto sem categoria Other
- Homepage: menos secções redundantes; loading em famílias canónicas
- Produto: secção lojas só com ofertas
- Mercado: loading/empty em marcas, lojas, tendências
- Discovery: `.catch` + alts em imagens
- `Button` com `type="button"` por omissão
- Ícones de fecho com `aria-hidden`

## Critérios

- [x] Zero alterações a motores / ranking / Search SQL / Scheduler / Telegram / Insights / Discovery / Marketplace / Smart Cart / Projetos / Taxonomy / endpoints
- [x] Suites de testes existentes verdes

## Impacto esperado

Menos ruído visual, menos bundle morto, estados de carga honestos, zero leak de “Other” na UI/PDF, melhor a11y básica.
