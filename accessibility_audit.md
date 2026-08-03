# Accessibility Audit — FASE 7.22

## Problemas encontrados

| Problema | Local |
|----------|-------|
| `Button` sem `type` default | Risco de submit acidental em forms |
| Ícones `X` sem `aria-hidden` | Drawers favoritos / comparar |
| Imagens de cards com `alt=""` | Home, mercado, discovery |
| Títulos `"…"` | Pouca informação durante load |

## Alterações realizadas

- `Button`: `type="button"` por omissão (override possível)
- `aria-hidden` nos ícones de fecho
- `alt` com nome do produto quando disponível
- Copy de loading legível (“A carregar”)

## Pendente / recomendações

- Auditoria completa de contraste WCAG AA em tema claro
- Tab order em drawers complexos (projetos / comparar)
- Labels explícitos em filtros taxonomy (já parcialmente ok)

## Impacto esperado

Menos ruído para screen readers; botões mais seguros em formulários; imagens descritivas em cards de descoberta.
