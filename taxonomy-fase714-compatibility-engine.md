# FASE 7.14 — Compatibility Engine v1

**Motor genérico de compatibilidade** (só aconselha). Regras activas: **PC Gaming**. Outros templates → Desconhecido (extensível).  
Auditoria prévia: `taxonomy-fase714-typed-attributes-audit.md`.

## Princípios

- Nunca bloqueia
- Nunca inventa specs
- Sem dados tipados → **Desconhecido**
- Sem alterar ranking / pesquisa / taxonomy / API / Limiar / Cart / Favoritos / Comparador

## Arquitectura

```text
evaluateProjectCompatibility(project)
  → CompatibilityRuleProvider (por template)
       └─ pc_gaming_v1  (activo)
       └─ (NAS / Streaming / … futuros via registerCompatibilityProvider)
```

## Regras PC Gaming (cobertura real)

| Par | Quando actua |
| --- | --- |
| CPU ↔ MB socket | Só se **ambos** têm `socket` tipado |
| Cooler ↔ CPU socket | Só se ambos têm `socket` |
| RAM DDR | Sempre Desconhecido (só brand na DB) |
| GPU length / TDP | Sempre Desconhecido |
| PSU wattage | Informa valor se existir; **não** marca «insuficiente» sem TDP |
| Case ATX / clearance | Desconhecido (`pc_case` só brand) |
| SSD form_factor | M.2/NVMe/SATA quando tipado |

## UI

Secção **Saúde do Projeto** em `/projetos/p/?id=` — score %, semáforo, slots ✔⚠✖?, timeline de compatibilidade.

## Critérios

- [x] Engine genérica + PC Gaming
- [x] Score / avisos / sugestões
- [x] Nunca bloquear / nunca inventar
- [x] Prep. novos templates
- [x] Testes a passar
