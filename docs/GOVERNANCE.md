# GOVERNANCE

# Objetivo

Definir como a documentação oficial Lymiar é atualizada, como se resolvem conflitos entre docs, e quando `NON_NEGOTIABLES` pode mudar.

# Âmbito

Docs canónicos listados em `README`. Não governa código diretamente; governa a norma que o código deve respeitar.

# Princípios

1. Poucos docs vinculativos; texto curto e verificável.
2. Conflito resolve-se por hierarquia — não por documento mais recente ou mais longo.
3. Auditorias e relatórios informam; nunca override `NON_NEGOTIABLES`.
4. Mudança de regra absoluta exige versão explícita no Histórico de `NON_NEGOTIABLES`.
5. Evolution over Revolution aplica-se também à documentação.

# Regras

## Hierarquia de conflito

1. `NON_NEGOTIABLES`
2. `VISION`
3. `PRODUCT_PRINCIPLES`
4. `ARCHITECTURE_PRINCIPLES`
5. `ENGINEERING_PRINCIPLES`
6. `DATA_PRINCIPLES`
7. `PRODUCT_VISION_2030`
8. `QUALITY_BAR`
9. `ROADMAP_V2`
10. `GOVERNANCE` / `README` (processo e índice)
11. Refs históricas / auditorias — não normativas

Em empate no mesmo nível, abrir alteração explícita via este processo.

## Como atualizar um doc canónico

1. Propor diff no ficheiro canónico (e cópias em `docs/` dos repos ativos).
2. Verificar que não contradiz um nível superior da hierarquia.
3. Atualizar a secção **Histórico** do próprio documento (data + nota).
4. Se a mudança afetar merge ou critérios: alinhar `QUALITY_BAR` ou referenciar o critério.
5. PRs de docs seguem a mesma disciplina: escopo claro, sem reescritas cosméticas gratuitas.

## Quando alterar `NON_NEGOTIABLES`

Só quando:

- a regra atual está errada face a evidência de produto/dados/segurança, **ou**
- falta uma regra absoluta necessária e verificável.

Obrigatório:

- bump de versão no **Histórico** de `NON_NEGOTIABLES` (ex.: vN → vN+1, data, motivo numa linha);
- atualizar testes/checklist que a tornavam verificável;
- não “reinterpretar” em silêncio noutra doc — alterar o texto da regra.

Proibido:

- enfraquecer `NON_NEGOTIABLES` via `ROADMAP_V2`, auditoria ou “exceção temporária” sem bump;
- mover uma regra absoluta para um doc de nível inferior.

## Auditorias e relatórios

- Podem recomendar itens para `ROADMAP_V2` (aceites ou REJEITADOS).
- Não criam obrigações novas se contradisserem docs canónicos.
- Itens rejeitados permanecem rejeitados até revisão explícita do roadmap com métricas — não por moda.

## Cópias nos repositórios

Docs oficiais devem manter-se alinhados entre:

- fonte em `Documents/Lymiar`
- `lymiar-hub/docs/`
- `lymiar-web/docs/` (subset relevante ao web/produto)

Conflito entre cópias: corrigir para o texto da fonte canónica; não “escolher a mais conveniente”.

# Exemplos

- Auditoria pede microserviços; `ROADMAP_V2` marca REJEITADO → não implementar; não alterar `NON_NEGOTIABLES`.
- Produto quer formulário de alerta sem persistência → bloqueado por `NON_NEGOTIABLES`; não “flexibilizar” em `PRODUCT_VISION_2030`.
- Nova regra “GET read-only” já em `NON_NEGOTIABLES` → só clarificar wording com bump de versão se o significado mudar.

# Anti-padrões

- Usar auditoria para burlar `NON_NEGOTIABLES`.
- Alterar regra absoluta sem linha no Histórico / sem bump de versão.
- Docs órfãos que contradizem canónicos.
- Tratar `QUALITY_BAR` N/A em massa para evitar a norma.
- Duas “fontes da verdade” divergentes entre repos.

# Relação com outros documentos

| Documento | Relação |
|-----------|---------|
| `README` | Índice e hierarquia resumida |
| `NON_NEGOTIABLES` | Único doc que exige bump de versão formal ao mudar regras |
| `QUALITY_BAR` | Gate que aplica a norma no merge |
| `ROADMAP_V2` | Plano subordinado; pode listar REJEITADO face a auditorias |

# Glossário

| Termo | Significado |
|-------|-------------|
| Canónico | Documento normativo |
| Bump de versão | Entrada explícita no Histórico de `NON_NEGOTIABLES` ao alterar regras |
| Override | Pretender que um doc inferior anule um superior — proibido |
| Ref histórica | Auditoria/relatório; contexto apenas |

# Histórico

| Data | Nota |
|------|------|
| 2026-08-03 | Criação. Hierarquia, processo de update, regra de bump em `NON_NEGOTIABLES`, auditorias não normativas. |
