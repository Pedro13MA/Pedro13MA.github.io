# FASE 7.13 — Projetos Inteligentes (Builds)

**Plataforma genérica de Projetos** (não é um configurador só de PC). Templates definem apenas slots. Motor Limiar, ranking, pesquisa, taxonomy, Smart Cart, Favoritos e Comparador **inalterados** — só reutilizados.

## Arquitectura

```text
UI (/projetos, botões)
  → projects service
  → ProjectStorageAdapter
       ├─ LocalProjectAdapter   (activo)
       └─ CloudProjectAdapter   (stub FASE 8)
```

`compatibilityVersion: 0` + `compatibilityHints` nos slots — validação CPU/RAM/fonte numa fase futura.

## Templates

Em branco · PC Gaming · PC Trabalho · Streaming · Home Office · NAS · Fotografia · Smart Home

## Páginas

| Rota | Função |
| --- | --- |
| `/projetos/` | Lista + wizard Novo Projeto |
| `/projetos/p/?id=` | Detalhe (static export) |

## Integrações

- **Adicionar ao Projeto** — produto, cards, comparador
- Pesquisa existente (`searchProducts`) no slot
- **Smart Cart** — adicionar tudo / só seleccionados
- **VS** — comparador existente

## Critérios

- [x] Sistema genérico + templates
- [x] Integração pesquisa / produto / categorias / comparador / cart
- [x] Prep. compatibilidade + cloud
- [x] Zero alterações motor / ranking / pesquisa / taxonomy
- [x] Testes a passar
